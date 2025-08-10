import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';

const MARBLE_BG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'; // Mármol negro demo

const LOGO_SVG = (
  <View style={styles.logoContainer}>
    {/* Boca minimalista sacando lengua negra */}
    <View style={styles.mouth}>
      <View style={styles.tongue} />
    </View>
  </View>
);

// Datos simulados para canciones
const songs = [
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
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [soundObj, setSoundObj] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, [soundObj]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: positionMillis / durationMillis,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [positionMillis]);

  const playSong = async (song) => {
    if (soundObj) {
      await soundObj.unloadAsync();
      setIsPlaying(false);
    }
    const { sound } = await Audio.Sound.createAsync({ uri: song.uri });
    setSoundObj(sound);
    setCurrentSong(song);
    setIsPlaying(true);
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPositionMillis(status.positionMillis);
        setDurationMillis(status.durationMillis || 1);
        setIsPlaying(status.isPlaying);
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      }
    });
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

  const renderSong = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => playSong(item)}
    >
      <Text style={styles.songTitle}>{item.title}</Text>
      <Text style={styles.songArtist}>{item.artist}</Text>
      <Text style={styles.songDuration}>{item.duration}</Text>
    </TouchableOpacity>
  );

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH - 40],
    extrapolate: 'clamp',
  });

  return (
    <ImageBackground
      source={{ uri: MARBLE_BG }}
      style={styles.container}
      imageStyle={{ opacity: 0.3 }}
      resizeMode="cover"
    >
      <View style={styles.header}>
        {LOGO_SVG}
        <Text style={styles.title}>Erickify</Text>
        <Text style={styles.subtitle}>Axel se la come</Text>
      </View>

      <View style={styles.content}>
        {currentScreen === 'Home' && (
          <FlatList
            data={songs}
            keyExtractor={(item) => item.id}
            renderItem={renderSong}
            style={{ flex: 1 }}
          />
        )}
        {currentScreen === 'Search' && (
          <View style={styles.centered}>
            <Text style={styles.placeholderText}>Buscar canciones...</Text>
          </View>
        )}
        {currentScreen === 'Library' && (
          <View style={styles.centered}>
            <Text style={styles.placeholderText}>Tu biblioteca</Text>
          </View>
        )}
      </View>

      <View style={styles.player}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.currentSongText}>
          {currentSong ? currentSong.title : 'Nada reproduciéndose'}
        </Text>
      </View>

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')} style={styles.navButton}>
          <Text style={[styles.navText, currentScreen === 'Home' && styles.navActive]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentScreen('Search')} style={styles.navButton}>
          <Text style={[styles.navText, currentScreen === 'Search' && styles.navActive]}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentScreen('Library')} style={styles.navButton}>
          <Text style={[styles.navText, currentScreen === 'Library' && styles.navActive]}>Biblioteca</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 60,
    marginBottom: 10,
  },
  mouth: {
    position: 'relative',
    width: 80,
    height: 40,
    backgroundColor: '#111',
    borderRadius: 40,
    borderColor: '#222',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tongue: {
    position: 'absolute',
    bottom: 2,
    width: 24,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1affd5',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  songItem: {
    backgroundColor: '#111',
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  songTitle: {
    fontSize: 18,
    color: '#1affd5',
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#888',
    marginTop: 4,
  },
  songDuration: {
    position: 'absolute',
    right: 15,
    top: 20,
    color: '#666',
  },
  player: {
    height: 70,
    borderTopColor: '#222',
    borderTopWidth: 1,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  playButton: {
    marginRight: 15,
  },
  playButtonText: {
    fontSize: 28,
    color: '#1affd5',
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1affd5',
  },
  currentSongText: {
    color: '#666',
    fontSize: 12,
    maxWidth: 120,
  },
  navbar: {
    height: 60,
    borderTopColor: '#222',
    borderTopWidth: 1,
    backgroundColor: '#111',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    padding: 10,
  },
  navText: {
    color: '#888',
    fontWeight: 'bold',
  },
  navActive: {
    color: '#1affd5',
    textDecorationLine: 'underline',
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
});
