import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  BackHandler,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenProps } from "./index.props";
import { isNonScrolling, offsets, presets } from "./index.presets";
import { color } from "../../theme";
import { useEffect, useState, useCallback } from "react";
import Loader from "../loader";
import KeyboardManager from "react-native-keyboard-manager";
import { useFocusEffect } from "@react-navigation/native";
import { AvoidSoftInput } from "react-native-avoid-softinput";

const isIos = Platform.OS === "ios";

function ScreenWithoutScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets();
  const preset = presets.fixed;
  const style = props.style || {};
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : {};
  const loading = Platform.OS === "ios" ? false : props.loading;
  const insetStyle = { paddingTop: props.unsafe ? 0 : insets.top };
  const androidBehavior = props.behavior === "none" ? undefined : "position";
  const backAction = props.customBackAction;

  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  useEffect(() => {
    if (loading) {
      if (!showSpinner) {
        setShowSpinner(true);

        setTimeout(() => {
          setShowSpinner(false);
        }, 3000);
      }
    }
  }, [loading, showSpinner]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backAction) {
          backAction();
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [backAction]),
  );

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : androidBehavior}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <StatusBar
        barStyle={props.statusBar || "dark-content"}
        backgroundColor={color.statusBar}
      />
      <Loader color={color.primary} showLoader={showSpinner} withOverlay />
      <View style={[preset.inner, style, insetStyle]}>{props.children}</View>
    </KeyboardAvoidingView>
  );
}

function ScreenWithScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets();
  const preset = presets.scroll;
  const style = props.style || {};
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : {};
  const insetStyle = { paddingTop: props.unsafe ? 0 : insets.top };
  const loading = props.loading;
  const backAction = props.customBackAction;
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const onFocusEffect = useCallback(() => {
    if (Platform.OS !== "ios") {
      AvoidSoftInput.setAdjustResize();
    } else {
      KeyboardManager.setEnable(true);
    }

    return () => {
      if (Platform.OS !== "ios") {
        AvoidSoftInput.setDefaultAppSoftInputMode();
      } else {
        KeyboardManager.setEnable(false);
      }
    };
  }, []);

  useFocusEffect(onFocusEffect);

  useEffect(() => {
    if (loading) {
      if (!showSpinner) {
        setShowSpinner(true);

        setTimeout(() => {
          setShowSpinner(false);
        }, 3000);
      }
    }
  }, [loading, showSpinner]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backAction) {
          backAction();
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [backAction]),
  );

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <StatusBar
        barStyle={props.statusBar || "dark-content"}
        backgroundColor={color.statusBar}
      />
      <View style={[preset.outer, backgroundStyle, insetStyle]}>
        <Loader color={color.primary} showLoader={showSpinner} withOverlay />
        <ScrollView
          style={[preset.outer, backgroundStyle]}
          contentContainerStyle={[preset.inner, style]}
          keyboardShouldPersistTaps={
            props.keyboardShouldPersistTaps || "handled"
          }
          showsVerticalScrollIndicator={false}
        >
          {props.children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export function Screen(props: ScreenProps) {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />;
  } else {
    return <ScreenWithScrolling {...props} />;
  }
}
