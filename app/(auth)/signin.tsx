import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Text, View } from "react-native";

export default function SigninScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.mainBackground]}>
               <Text>Signin Screen</Text>
          </View>
     )
}