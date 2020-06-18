import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, Image, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton, TextInput } from 'react-native-gesture-handler'
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import ibgeApi from '../../services/ibgeApi';
import RNPickerSelect from 'react-native-picker-select';

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

export const Home = () => {
    // Desafio é utilizar o react-native-picker-select juntamente com a api do ibge para
    // pegar os dados de estados e cidades igual fizemos na web
    const [uf, setUf] = useState('')
    const [city, setCity] = useState('')
    const [cities, setCities] = useState<string[]>([])
    const [ufs, setUfs] = useState<string[]>([])

    const navigation = useNavigation()

    useEffect(() => {
        ibgeApi.get<IBGECityResponse[]>('/estados/' + uf + '/municipios').then(response => {
            setCities(response.data.map(item => item.nome))
            setCity('')
        }).catch(err => {
            console.log('Error', err)
        })
    }, [uf])

    useEffect(() => {
        ibgeApi.get<IBGEUFResponse[]>('/estados').then(response => {
            setUfs(response.data.map(item => item.sigla))
        }).catch(err => {
            console.log('Error', err)
        })
    }, [])

    function handleNavigateToPoints() {
        navigation.navigate('Points', { uf, city })
    }
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ImageBackground
                source={require('../../assets/home-background.png')}
                style={styles.container}
                imageStyle={{ width: 274, height: 368 }}
            >
                <View style={styles.main}>
                    <Image source={require('../../assets/logo.png')} />
                    <View>
                        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <RNPickerSelect
                        onValueChange={(value) => setUf(value)}
                        items={ufs.map(item => ({ label: item, value: item }))}
                    />
                    <RNPickerSelect
                        onValueChange={(value) => setCity(value)}
                        items={cities.map(item => ({ label: item, value: item }))}
                    />
                    {/* <TextInput style={styles.input} value={uf} maxLength={2} autoCapitalize="characters" autoCorrect={false} placeholder="Digite a UF (Ex.: MG)" onChangeText={setUf} /> */}
                    {/* <TextInput style={styles.input} value={city} autoCorrect={false} placeholder="Digite a Cidade" onChangeText={setCity} /> */}
                    <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                        <View style={styles.buttonIcon}>
                            <Text><Icon name="arrow-right" color="#FFF" size={24} /></Text>
                        </View>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});