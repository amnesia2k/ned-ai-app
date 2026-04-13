# UI Issues Report - Chat Screen

This document describes UI issues identified in the chat screen of the `nedai-app`.

## 1. Input-to-Tabs Spacing
- **Issue:** The chat input bar (at the bottom of the screen) is positioned too close to the bottom tab navigation.
- **Goal:** Add extra vertical space (margin-bottom) to separate the input container from the tabs.

## 2. Input Box Alignment (Malformed Shape)
- **Issue:** The `TextInput` container has uneven vertical padding. There is visibly more empty space at the top of the box than at the bottom, making it look unbalanced.
- **Goal:** Equalize the top and bottom padding of the input box or use `vertical-align: center` to ensure the text field is perfectly centered.

## 3. Keyboard Interaction (iOS)
- **Issue:** When the keyboard is active, the input bar and the cursor are partially obscured or inconveniently positioned relative to the keyboard.
- **Goal:** Ensure the input bar shifts correctly with the keyboard using a responsive keyboard-avoidance strategy.

## 4. Keyboard Interaction (Android)
- **Issue:** On Android, the software keyboard completely covers the input bar when it opens. The user cannot see the message they are typing.
- **Goal:** Implement a keyboard-avoiding container (e.g., `KeyboardAvoidingView` with `behavior="height"` or using `react-native-keyboard-controller`) to ensure the input bar stays visible above the keyboard on Android.
