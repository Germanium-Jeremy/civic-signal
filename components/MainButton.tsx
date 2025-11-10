import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Pressable, Text } from "react-native";

interface MainButtonProps {
     title?: string
     toDo?: () => void
     isFullWidth?: boolean
     isDark?: boolean
     disabled?: boolean
}

export default function MainButton(props: MainButtonProps) {
     const mainStyles = useStylesGlobal({ mainBtn: { isDark: props.isDark } })

     return (
          <Pressable style={[mainStyles.mainButton, { width: props.isFullWidth ? '100%' : 'auto' }]}
               onPress={props.toDo} disabled={props.disabled}
          >
               <Text style={[mainStyles.mainButtonText]}>{ props.title }</Text>
          </Pressable>
     )
}