import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { Audio } from 'expo-av';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const MARBLE_BG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const songsData = [
  {
    id: '1',
    title: 'Eclipse Solar',
    artist: 'Erick Beats',
    duration: '3:45',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Noches Oscuras',
    artist: 'Mármol Waves',
    duration: '4:12',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Luz Neón',
    artist: 'Brillo Noir',
    duration: '2:58',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Sombra Infinita',
    artist: 'Dark Pulse',
    duration: '3:33',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Cielo Obsidiana',
    artist: 'Nightfall',
    duration: '4:00',
    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
];

export default function Erickify() {
  // Estados y refs
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [soundObj, setSoundObj] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  // Animaciones infinitas
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

    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, []);

  // Manejo de audio
  useEffect(() => {
    if (!soundObj) return;

    soundObj.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPositionMillis(status.positionMillis);
        setDurationMillis(status.durationMillis || 1);
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) {
          playNextSong();
        }
      }
    });
  }, [soundObj]);

  const playSong = async (index) => {
    if (soundObj) {
      await soundObj.unloadAsync();
      setIsPlaying(false);
    }
    const song = songsData[index];
    const { sound } = await Audio.Sound.createAsync({ uri: song.uri });
    setSoundObj(sound);
    setCurrentSongIndex(index);
    setIsPlaying(true);
    await sound.playAsync();
  };

  const togglePlayPause = async () => {
    if (!soundObj) return;
    if (isPlaying) {
      await soundObj.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundObj.playAsync();
      setIsPlaying(true);
    }
  };

  const playNextSong = () => {
    if (currentSongIndex === null) return;
    const nextIndex = (currentSongIndex + 1) % songsData.length;
    playSong(nextIndex);
  };

  const playPrevSong = () => {
    if (currentSongIndex === null) return;
    const prevIndex = (currentSongIndex - 1 + songsData.length) % songsData.length;
    playSong(prevIndex);
  };

  // Animaciones interpoladas
  const glowInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.6)', 'rgba(50,50,50,0.9)'],
  });

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -150],
  });

  const rotation = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Progreso barra
  const progressWidth = positionMillis
    ? (positionMillis / durationMillis) * (SCREEN_WIDTH * 0.6)
    : 0;

  // Render canción
  const renderSong = ({ item, index }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, []);

    const isActive = index === currentSongIndex;

    return (
      <Animated.View style={[styles.songItem, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity onPress={() => playSong(index)} style={isActive ? styles.activeSong : null}>
          <Text style={[styles.songTitle, isActive && styles.activeSongTitle]}>{item.title}</Text>
          <Text style={[styles.songArtist, isActive && styles.activeSongArtist]}>{item.artist}</Text>
          <Text style={styles.songDuration}>{item.duration}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Logo animado (simula 3D con rotación y sombra)
  const Logo3D = () => (
    <Animated.View style={[styles.logoMouth, { transform: [{ rotateY: rotation }], shadowColor: glowInterpolation, shadowRadius: 10, shadowOpacity: 0.9 }]}>
      <View style={styles.tongue} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: MARBLE_BG }}
        style={styles.container}
        imageStyle={{ opacity: 0.7 }}
        resizeMode="repeat"
      >
        <Animated.View style={[styles.header, { transform: [{ scale: pulseAnim }] }]}>
          <Logo3D />
          <Text style={styles.title}>Erickify</Text>
          <Text style={styles.subtitle}>Axel se la come</Text>
        </Animated.View>

        <Animated.View style={[styles.buttonsContainer, { backgroundColor: glowInterpolation, transform: [{ translateX }] }]}>
          {['Inicio', 'Buscar', 'Biblioteca'].map((btn) => (
            <TouchableOpacity
              key={btn}
              style={[styles.button, { shadowColor: glowInterpolation, shadowRadius: 14, shadowOpacity: 0.8 }]}
              onPress={() => setCurrentScreen(btn)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{btn}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={styles.content}>
          {currentScreen === 'Home' && (
            <FlatList
              data={songsData}
              keyExtractor={(item) => item.id}
              renderItem={renderSong}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          )}

          {currentScreen === 'Buscar' && (
            <View style={styles.centered}>
              <Text style={styles.placeholderText}>Funcionalidad de búsqueda en desarrollo...</Text>
            </View>
          )}

          {currentScreen === 'Biblioteca' && (
            <View style={styles.centered}>
              <Text style={styles.placeholderText}>Tu biblioteca está vacía por ahora.</Text>
            </View>
          )}
        </View>

        <View style={styles.player}>
          <TouchableOpacity
            onPress={playPrevSong}
            style={[styles.controlButton, { shadowColor: glowInterpolation, shadowRadius: 8, shadowOpacity: 0.8 }]}
          >
            <Text style={styles.controlText}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={[styles.playButton, { shadowColor: glowInterpolation, shadowRadius: 12, shadowOpacity: 0.9 }]}
          >
            <Text style={styles.playButtonText}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playNextSong}
            style={[styles.controlButton, { shadowColor: glowInterpolation, shadowRadius: 8, shadowOpacity: 0.8 }]}
          >
            <Text style={styles.controlText}>⏭</Text>
          </TouchableOpacity>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoMouth: {
    width: 100,
    height: 50,
    backgroundColor: '#111',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  tongue: {
    position: 'absolute',
    bottom: 10,
    width: 30,
    height: 15,
    backgroundColor: '#000',
    borderRadius: 15,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1affd5',
    textShadowColor: '#000a',
    textShadowRadius: 14,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 18,
    borderRadius: 30,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: '#1affd5',
    fontWeight: '900',
    fontSize: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  songItem: {
    backgroundColor: '#111',
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  activeSong: {
    borderColor: '#1affd5',
    borderWidth: 2,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1affd5',
  },
  activeSongTitle: {
    color: '#00fff9',
  },
  songArtist: {
    color: '#888',
    marginTop: 4,
  },
  activeSongArtist: {
    color: '#33fff9',
  },
  songDuration: {
    position: 'absolute',
    right: 20,
    top: 18,
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 18,
    fontStyle: 'italic',
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 50,
    shadowColor: '#1affd5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  playButton: {
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 24,
    marginHorizontal: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  playButtonText: {
    fontSize: 36,
    color: '#1affd5',
    fontWeight: '900',
  },
  controlButton: {
    padding: 14,
    marginHorizontal: 6,
    borderRadius: 40,
    backgroundColor: '#111',
  },
  controlText: {
    fontSize: 24,
    color: '#1affd5',
    fontWeight: 'bold',
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#222',
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 24,
    marginRight: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1affd5',
  },
});
