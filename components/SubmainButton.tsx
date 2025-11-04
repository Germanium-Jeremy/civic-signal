import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Pressable, Text } from "react-native";

interface SubButtonProps {
     title?: string;
     toDo?: () => void;
     isFullWidth?: boolean;
     isDark?: boolean;
}

export default function SubMainButton(props: SubButtonProps) {
     const mainStyles = useStylesGlobal({ mainBtn: { isDark: props.isDark } })

     return (
          <Pressable style={[mainStyles.subButton, { width: props.isFullWidth ? '100%' : 'auto' }]} onPress={props.toDo}>
               <Text style={[mainStyles.subButtonText]}>{ props.title }</Text>
          </Pressable>
     )
}