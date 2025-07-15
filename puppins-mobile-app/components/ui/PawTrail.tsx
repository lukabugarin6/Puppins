import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import PawIcon from "../../assets/icons/paw.svg";

interface AnimationValue {
  top: number;
  left: number;
  rotate: number;
}

interface Props {
  animationValues: AnimationValue[];
}

export const PawTrail: React.FC<Props> = ({ animationValues }) => {
  return (
    <>
      {animationValues.map((obj, index) => {
        const opacity = useSharedValue(0);

        useEffect(() => {
          opacity.value = withDelay(
            index * 200,
            withTiming(0.6, { duration: 250 })
          );
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacity.value,
          top: `${obj.top + 10}%`,
          left: `${obj.left}%`,
          transform: [{ rotate: `${obj.rotate}deg` }],
        }));

        return (
          <Animated.View
            key={index}
            style={[styles.paw as ViewStyle, animatedStyle]}
          >
            <PawIcon />
          </Animated.View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  paw: {
    position: "absolute",
    zIndex: 1,
  },
});
