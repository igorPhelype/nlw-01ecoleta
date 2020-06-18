import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import './styles.css'
import logo from '../../assets/logo.svg'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../../services/api'
import ibgeApi from '../../services/ibgeApi'
import { LeafletMouseEvent } from 'leaflet'
import Dropzone from '../../components/Dropzone'

interface Item {
    id: number,
    image: string,
    title: string,
    image_url: string,
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint: React.FC = (props) => {

    // estados para controle do mapa
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0, 0])
    const [zoom, setZoom] = useState(13)
    const [position, setPosition] = useState<[number,number]>([0, 0])
    
    // estado de array ou objeto no typescript: Informar o tipo (interface)
    const [items, setItems] = useState<Item[]>([]) // ou useState<Array<Item>>

    // state ibge
    const [ufs, setUfs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    // inputs state
    const [formData, setFormdata] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })
    const [uf, setUf] = useState('')
    const [city, setCity] = useState('')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedFile, setSelectedFile] = useState<File>()

    const history = useHistory()

    useEffect(() => {
        api.get('/items').then(response => {
            setItems(response.data.items)
        }).catch(err => {
            console.log('Error', err)
        })
    }, [])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords
            setInitialPosition([latitude, longitude])
        })
    }, [])

    useEffect(() => {
        ibgeApi.get<IBGEUFResponse[]>('/estados').then(response => {
            setUfs(response.data.map(item => item.sigla))
        }).catch(err => {
            console.log('Error', err)
        })
    }, [])

    useEffect(() => {
        ibgeApi.get<IBGECityResponse[]>('/estados/'+uf+'/municipios').then(response => {
            setCities(response.data.map(item => item.nome))
            setCity('')
        }).catch(err => {
            console.log('Error', err)
        })
    }, [uf])

    const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        setFormdata({...formData, [event.target.name]: event.target.value})
    }

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        setUf(event.target.value)
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        setCity(event.target.value)
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id)
        if(alreadySelected >= 0){
            setSelectedItems(selectedItems.filter(item => item !== id))
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    function handleMapClick(event: LeafletMouseEvent){
        const {lat, lng} = event.latlng
        setPosition([lat, lng])
    }

    function handleSubmit(event: FormEvent){
        event.preventDefault()
        const [latitude, longitude] = position
        const {
            name,
            email,
            whatsapp,
        } = formData
        const pointData = new FormData()
        pointData.append('name', name)
        pointData.append('email', email)
        pointData.append('whatsapp', whatsapp)
        pointData.append('uf', uf)
        pointData.append('city', city)
        pointData.append('latitude', String(latitude))
        pointData.append('longitude', String(longitude))
        pointData.append('items', selectedItems.join(','))
        if(selectedFile){
            pointData.append('image', selectedFile)
        }
        api.post('/point', pointData).then(response => {
            console.log(response)
            // history.push('/conclude-screen') // redirecionar para a tela de conclusão
            history.push('/')
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit} action="">
                <h1>Cadastro do<br /> Ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile} />
                <fieldset>
                    <legend><h2>Dados</h2></legend>
                    <div className="field">
                        <label htmlFor="name">Nome</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChangeInput}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChangeInput}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                id="whatsapp"
                                name="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChangeInput}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map onclick={handleMapClick} center={initialPosition} zoom={zoom}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position}>
                            <Popup>
                                A pretty CSS3 popup. <br /> Easily customizable.
                            </Popup>
                        </Marker>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                id="uf"
                                name="uf"
                                onChange={handleSelectedUf}
                                value={uf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                id="city"
                                name="city"
                                value={city}
                                onChange={handleSelectedCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Items de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => 
                            <li className={selectedItems.includes(item.id)?"selected":""} onClick={() => handleSelectedItem(item.id)} key={item.id}>
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        )}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint