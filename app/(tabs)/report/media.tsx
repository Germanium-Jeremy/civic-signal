import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Text, View } from "react-native";

export default function MediaAttachScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.pages, { justifyContent: 'center', gap: 40 }]}>
               <Text style={[mainStyles.authTitles]}>Add supportive evidence.</Text>

               <View style={{ gap: 10 }}>
                    <InputElement placeholder="Select Issue Category" />
                    <InputElement placeholder="Select Issue Priority" />
                    <InputElement isTextArea placeholder="Enter the description of the issue you are reporting." />
               </View>
               
               <Text style={[mainStyles.normalText]}>Supportive media files are optional in case they are not available. You can submit without them. But they help in taking your issue serious as the site receive many scam reports.</Text>

               <MainButton isDark title="Report" />
          </View>
     )
}