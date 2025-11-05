import { MainColors } from "@/constants/theme"
import { StyleSheet } from "react-native"

interface UseStylesProps {
     mainBtn?: {
          isDark?: boolean
     }
}

export const useStylesGlobal = (props?: UseStylesProps) => {
     return StyleSheet.create({
          mainBackground: {
               flex: 1,
               backgroundColor: MainColors["Main Background"],
               paddingHorizontal: 15,
               paddingVertical: 20,
               fontFamily: 'EBGaramond'
          },
          authBackground: {
               flex: 1,
               backgroundColor: MainColors["Main Background"],
               paddingHorizontal: 15,
               justifyContent: 'center',
               alignItems: 'center',
               gap: 20,
               fontFamily: 'EBGaramond'
          },
          mainButton: {
               backgroundColor: props?.mainBtn?.isDark ? MainColors["Almost Black"] : MainColors["Primary Blue"],
               borderRadius: 20,
               paddingVertical: 15,
               paddingHorizontal: 20,
               alignItems: 'center',
               justifyContent: 'center'
          },
          subButton: {
               backgroundColor: props?.mainBtn?.isDark ? MainColors["Neutral Gray"] : MainColors["Light Gray"],
               borderRadius: 20,
               paddingVertical: 10,
               paddingHorizontal: 20,
               alignItems: 'center',
               justifyContent: 'center'
          },
          mainButtonText: {
               color: MainColors["Main Background"],
               fontSize: 18,
               fontWeight: 800,
               fontFamily: 'EBGaramond',
          },
          subButtonText: {
               color: MainColors["Almost Black"],
               fontSize: 15,
               fontWeight: 500,
               fontFamily: 'EBGaramond'
          },
          authTitles: {
               fontSize: 24,
               fontWeight: 500,
               fontFamily: 'EBGaramond',
               textAlign: 'center',
               color: MainColors["Almost Black"]
          },
          normalText: {
               fontSize: 16,
               fontWeight: 500,
               fontFamily: 'EBGaramond',
               color: MainColors["Almost Black"]
          },
          tabs: {
               flex: 1,
               paddingBottom: 10,
               backgroundColor: MainColors["Main Background"]
          },
          pages: {
               paddingHorizontal: 20,
               paddingVertical: 30,
               backgroundColor: MainColors["Main Background"],
               flex: 1,
               gap: 20,
          }
     })
}