import { MainColors } from "@/constants/theme";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface InputElementProps {
     placeholder?: string
     text?: string
     isTextArea?: boolean
     isDropdown?: boolean
     onChange?: React.Dispatch<React.SetStateAction<string>> | (() => void)
     isEmail?: boolean
     autoCapitalize?: boolean
     isPhone?: boolean
     isPassword?: boolean
}

export default function InputElement(props: InputElementProps) {
     return (
          <View style={[styles.container]}>
               <TextInput placeholder={props.placeholder} value={props.text} onChangeText={props.onChange}
                    style={[styles.inputElement, { minHeight: props.isTextArea ? 100 : 10 }]}
                    placeholderTextColor={MainColors["Primary Blue"]} multiline={props.isTextArea} numberOfLines={props.isTextArea ? 10 : 1}
                    keyboardType={props.isEmail ? "email-address" : props.isPhone ? "phone-pad" : "ascii-capable"}
                    secureTextEntry={props.isPassword ? true : false}
               />
          </View>
     )
}

const styles = StyleSheet.create({
     container: {
          paddingHorizontal: 15, 
          borderRadius: 20,
          borderColor: MainColors["Primary Blue"],
          borderWidth: 1,
          width: '100%',
     },
     inputElement: {
          paddingVertical: 12,
          fontSize: 16,
          color: MainColors["Almost Black"],
          fontFamily: 'EBGaramond',
     }
})