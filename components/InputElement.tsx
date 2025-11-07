import { MainColors } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";

interface InputElementProps {
     placeholder?: string
     text?: string
     isTextArea?: boolean
     isDropdown?: boolean
     onChange?: () => void
}

export default function InputElement(props: InputElementProps) {
     return (
          <View style={[styles.container]}>
               <TextInput placeholder={props.placeholder} style={[styles.inputElement, { minHeight: props.isTextArea ? 100 : 10 }]} value={props.text} onChange={props.onChange} placeholderTextColor={MainColors["Primary Blue"]} multiline={props.isTextArea} numberOfLines={props.isTextArea ? 10 : 1} />
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
          outline: 'none'
     }
})