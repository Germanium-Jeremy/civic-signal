import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { View, Image, Text } from "react-native";
import { useLocalSearchParams } from "expo-router/build/hooks";

export default function VerifyAccountScreen() {
     const mainStyles = useStylesGlobal()
     const searchParams = useLocalSearchParams()
     const option = searchParams.option ? searchParams.option : 'Account'
     
     return (
          <View style={[mainStyles.authBackground, { gap: 50 }]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -50 }]}>Verify your { option }</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Code" />
               </View>

               <MainButton title={`Verify ${option}`} isFullWidth />

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Didn't get the code?</Text>
          </View>
     )
}
