import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator, Alert, Image, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/animes';
// Para usar o Expo Go no celular, troque localhost pelo IPv4 do computador.
const vazio = { titulo: '', genero: '', nota: '', capa_url: '' };

export default function App() {
  const [animes, setAnimes] = useState([]);
  const [formulario, setFormulario] = useState(vazio);
  const [idEditando, setIdEditando] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarAnimes() {
    setCarregando(true);
    setErro('');
    try {
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error('Não foi possível consultar a API.');
      setAnimes(await resposta.json());
    } catch (_e) {
      setErro('Não consegui conectar à API. Confira se o MySQL e o servidor da API estão ligados.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarAnimes(); }, []);

  function abrirNovo() {
    setIdEditando(null);
    setFormulario(vazio);
    setModalVisivel(true);
  }

  function abrirEdicao(anime) {
    setIdEditando(anime.id);
    setFormulario({
      titulo: anime.titulo,
      genero: anime.genero || '',
      nota: String(anime.nota),
      capa_url: anime.capa_url || '',
    });
    setModalVisivel(true);
  }

  async function salvarAnime() {
    const nota = Number(formulario.nota);
    if (!formulario.titulo.trim() || !Number.isFinite(nota) || nota < 0 || nota > 10) {
      Alert.alert('Confira os dados', 'Informe o título e uma nota de 0 a 10.');
      return;
    }

    const metodo = idEditando ? 'PUT' : 'POST';
    const url = idEditando ? API_URL + '/' + idEditando : API_URL;
    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formulario,
          titulo: formulario.titulo.trim(),
          nota,
        }),
      });
      const resultado = await resposta.json();
      if (!resposta.ok) throw new Error(resultado.erro || 'Não foi possível salvar.');
      setModalVisivel(false);
      await carregarAnimes();
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message);
    }
  }

  async function excluirAnime(anime) {
    const confirmar = async () => {
      try {
        const resposta = await fetch(API_URL + '/' + anime.id, { method: 'DELETE' });
        if (!resposta.ok) throw new Error('Não foi possível excluir o anime.');
        await carregarAnimes();
      } catch (e) {
        Alert.alert('Erro ao excluir', e.message);
      }
    };

    if (Platform.OS === 'web') {
      if (globalThis.confirm('Excluir "' + anime.titulo + '"?')) await confirmar();
    } else {
      Alert.alert('Excluir anime', 'Deseja excluir "' + anime.titulo + '"?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar },
      ]);
    }
  }

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.topo}>
          <Text style={styles.selo}>ANIME • MINHA COLEÇÃO</Text>
          <Text style={styles.tituloPagina}>No meu radar</Text>
          <Text style={styles.subtitulo}>Uma lista simples dos animes que marcaram você.</Text>
          <View style={styles.linhaTopo}>
            <Text style={styles.contagem}>{animes.length} {animes.length === 1 ? 'anime' : 'animes'}</Text>
            <Pressable style={styles.botaoPrincipal} onPress={abrirNovo}>
              <Text style={styles.textoBotaoPrincipal}>＋ Adicionar</Text>
            </Pressable>
          </View>
        </View>

        {carregando ? (
          <ActivityIndicator color="#b9a3ff" size="large" style={styles.estado} />
        ) : erro ? (
          <View style={styles.aviso}>
            <Text style={styles.avisoTitulo}>A API ainda não respondeu</Text>
            <Text style={styles.avisoTexto}>{erro}</Text>
            <Pressable style={styles.botaoSecundario} onPress={carregarAnimes}>
              <Text style={styles.textoBotaoSecundario}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : animes.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.emojiVazio}>✦</Text>
            <Text style={styles.vazioTitulo}>Sua lista começa aqui</Text>
            <Text style={styles.vazioTexto}>Adicione um anime, escolha uma capa e dê sua nota.</Text>
          </View>
        ) : (
          <View style={styles.grade}>
            {animes.map((anime) => (
              <View key={anime.id} style={styles.cartao}>
                {anime.capa_url ? (
                  <Image source={{ uri: anime.capa_url }} style={styles.capa} />
                ) : (
                  <View style={[styles.capa, styles.capaVazia]}>
                    <Text style={styles.capaVaziaIcone}>✦</Text>
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.genero}>{anime.genero || 'ANIME'}</Text>
                  <Text style={styles.tituloAnime} numberOfLines={2}>{anime.titulo}</Text>
                  <Text style={styles.nota}>★ {Number(anime.nota).toFixed(1)} <Text style={styles.dez}>/ 10</Text></Text>
                  <View style={styles.acoes}>
                    <Pressable style={styles.botaoEditar} onPress={() => abrirEdicao(anime)}>
                      <Text style={styles.textoAcao}>Editar</Text>
                    </Pressable>
                    <Pressable style={styles.botaoExcluir} onPress={() => excluirAnime(anime)}>
                      <Text style={styles.textoExcluir}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.rodape}>CRUD • React Native + API + MySQL</Text>
      </ScrollView>

      <Modal visible={modalVisivel} transparent animationType="fade" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.fundoModal}>
          <ScrollView contentContainerStyle={styles.centroModal} keyboardShouldPersistTaps="handled">
            <View style={styles.modal}>
              <Text style={styles.rotuloModal}>{idEditando ? 'ATUALIZAR' : 'NOVO REGISTRO'}</Text>
              <Text style={styles.tituloModal}>{idEditando ? 'Editar anime' : 'Adicionar anime'}</Text>
              <Text style={styles.label}>Título *</Text>
              <TextInput style={styles.input} value={formulario.titulo} onChangeText={(titulo) => setFormulario({ ...formulario, titulo })} placeholder="Ex.: Frieren" placeholderTextColor="#77758c" />
              <Text style={styles.label}>Gênero</Text>
              <TextInput style={styles.input} value={formulario.genero} onChangeText={(genero) => setFormulario({ ...formulario, genero })} placeholder="Ex.: Aventura, fantasia" placeholderTextColor="#77758c" />
              <Text style={styles.label}>Nota de 0 a 10 *</Text>
              <TextInput style={styles.input} value={formulario.nota} onChangeText={(nota) => setFormulario({ ...formulario, nota })} placeholder="Ex.: 9.5" placeholderTextColor="#77758c" keyboardType="decimal-pad" />
              <Text style={styles.label}>Link da imagem da capa</Text>
              <TextInput style={styles.input} value={formulario.capa_url} onChangeText={(capa_url) => setFormulario({ ...formulario, capa_url })} placeholder="https://..." placeholderTextColor="#77758c" autoCapitalize="none" />
              <View style={styles.acoesModal}>
                <Pressable style={styles.botaoCancelar} onPress={() => setModalVisivel(false)}>
                  <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.botaoPrincipal} onPress={salvarAnime}>
                  <Text style={styles.textoBotaoPrincipal}>Salvar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#11101a' },
  conteudo: { width: '100%', maxWidth: 1080, alignSelf: 'center', padding: 24, paddingTop: 38, paddingBottom: 40 },
  topo: { marginBottom: 28 },
  selo: { color: '#b9a3ff', letterSpacing: 2, fontSize: 11, fontWeight: '800' },
  tituloPagina: { color: '#f4f0ff', fontSize: 38, fontWeight: '800', marginTop: 10 },
  subtitulo: { color: '#aaa6ba', fontSize: 15, marginTop: 7 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  contagem: { color: '#d8d2e8', fontWeight: '700' },
  botaoPrincipal: { backgroundColor: '#9b7bff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  textoBotaoPrincipal: { color: '#171222', fontWeight: '800' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cartao: { flexDirection: 'row', backgroundColor: '#1c1a28', borderColor: '#302c40', borderWidth: 1, borderRadius: 16, padding: 12, width: '100%', maxWidth: 520, minHeight: 164 },
  capa: { width: 100, height: 140, borderRadius: 10, backgroundColor: '#292536' },
  capaVazia: { justifyContent: 'center', alignItems: 'center' },
  capaVaziaIcone: { color: '#a98aff', fontSize: 34 },
  info: { flex: 1, paddingLeft: 14, justifyContent: 'center' },
  genero: { color: '#b9a3ff', fontSize: 10, letterSpacing: 1.4, fontWeight: '800', textTransform: 'uppercase' },
  tituloAnime: { color: '#f4f0ff', fontWeight: '800', fontSize: 18, marginTop: 5 },
  nota: { color: '#ffd36e', fontSize: 14, fontWeight: '800', marginTop: 8 },
  dez: { color: '#918ca1', fontWeight: '500' },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 12 },
  botaoEditar: { borderColor: '#554878', borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  botaoExcluir: { borderColor: '#5c3944', borderWidth: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  textoAcao: { color: '#d8cbff', fontWeight: '700', fontSize: 12 },
  textoExcluir: { color: '#ff9eaa', fontWeight: '700', fontSize: 12 },
  estado: { marginTop: 80 },
  aviso: { backgroundColor: '#211c29', borderRadius: 16, padding: 22, borderColor: '#483246', borderWidth: 1 },
  avisoTitulo: { color: '#ffd2a8', fontWeight: '800', fontSize: 17 },
  avisoTexto: { color: '#c3bdcd', marginTop: 8, lineHeight: 21 },
  botaoSecundario: { alignSelf: 'flex-start', marginTop: 16, borderColor: '#64547d', borderWidth: 1, borderRadius: 9, padding: 10 },
  textoBotaoSecundario: { color: '#ded5f5', fontWeight: '700' },
  vazio: { backgroundColor: '#1c1a28', borderColor: '#302c40', borderWidth: 1, borderRadius: 16, alignItems: 'center', padding: 44 },
  emojiVazio: { color: '#b9a3ff', fontSize: 38 },
  vazioTitulo: { color: '#f4f0ff', fontWeight: '800', fontSize: 20, marginTop: 14 },
  vazioTexto: { color: '#aaa6ba', marginTop: 7, textAlign: 'center' },
  rodape: { color: '#6e697d', textAlign: 'center', marginTop: 34, fontSize: 12 },
  fundoModal: { flex: 1, backgroundColor: 'rgba(7, 6, 12, 0.84)', justifyContent: 'center', padding: 18 },
  centroModal: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#1c1a28', borderColor: '#39334b', borderWidth: 1, borderRadius: 18, padding: 22, width: '100%', maxWidth: 480 },
  rotuloModal: { color: '#b9a3ff', fontSize: 10, letterSpacing: 1.8, fontWeight: '800' },
  tituloModal: { color: '#f4f0ff', fontWeight: '800', fontSize: 24, marginTop: 7, marginBottom: 18 },
  label: { color: '#c8c2d5', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { color: '#f4f0ff', backgroundColor: '#13121c', borderColor: '#39334b', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  acoesModal: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 22 },
  botaoCancelar: { borderColor: '#554878', borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
});
