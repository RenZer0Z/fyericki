import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// URL de textura mármol negro con algo de ruido para animar
const MARBLE_BG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

export default function Erickify() {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;

  // Animación infinita de brillo
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Pulso suave y eterno
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Movimiento horizontal lento para fondo mármol
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Interpolación para brillo negro en botones
  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.6)', 'rgba(50,50,50,0.9)'],
  });

  // Movimiento del fondo (desplazamiento horizontal lento)
  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  return (
    <ImageBackground
      source={{ uri: MARBLE_BG }}
      style={styles.container}
      imageStyle={{ opacity: 0.6 }}
      resizeMode="repeat"
    >
      <Animated.View style={[styles.header, { transform: [{ scale: pulseAnim }] }]}>
        {/* Logo animado (boca sacando lengua) */}
        <Animated.View style={[styles.logoMouth, { shadowColor: glowInterpolation, shadowRadius: glowAnim.interpolate({ inputRange: [0,1], outputRange: [2, 8] }) }]}>
          <View style={styles.tongue} />
        </Animated.View>

        <Text style={styles.title}>Erickify</Text>
        <Text style={styles.subtitle}>Axel se la come</Text>
      </Animated.View>

      <Animated.View style={[styles.buttonsContainer, { backgroundColor: glowInterpolation, transform: [{ translateX }] }]}>
        {['Inicio', 'Buscar', 'Biblioteca'].map((btn) => (
          <TouchableOpacity key={btn} style={[styles.button, { shadowColor: glowInterpolation, shadowRadius: glowAnim.interpolate({ inputRange: [0,1], outputRange: [4, 14] }) }]}>
            <Text style={styles.buttonText}>{btn}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <View style={styles.player}>
        <TouchableOpacity style={[styles.playButton, { shadowColor: glowInterpolation, shadowRadius: glowAnim.interpolate({ inputRange: [0,1], outputRange: [2, 10] }) }]}>
          <Text style={styles.playButtonText}>▶</Text>
        </TouchableOpacity>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width: SCREEN_WIDTH * 0.6, backgroundColor: glowInterpolation }]} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoMouth: {
    width: 80,
    height: 40,
    backgroundColor: '#111',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
  tongue: {
    position: 'absolute',
    bottom: 6,
    width: 24,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1affd5',
    textShadowColor: '#000a',
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    marginBottom: 50,
    paddingVertical: 20,
    borderRadius: 20,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
  buttonText: {
    color: '#1affd5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 40,
    shadowColor: '#1affd5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    width: SCREEN_WIDTH * 0.9,
  },
  playButton: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 18,
    marginRight: 30,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
  },
  playButtonText: {
    fontSize: 28,
    color: '#1affd5',
    fontWeight: '900',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1affd5',
  },
});
