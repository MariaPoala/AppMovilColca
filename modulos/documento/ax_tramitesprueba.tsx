import { useEffect, useReducer, useState, Fragment } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Dialog, Transition } from "@headlessui/react";
import { AxInput} from 'components/form'
import { EnumTipoEdicion, EnumEstadoEdicion, TypeFormularioProps } from 'lib/edicion'
import { CheckIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon, LinkIcon, PlusCircleIcon } from "@heroicons/react/outline"
import TipoDocumentoModel from 'models/tipo_documento_model'
import * as uuid from 'uuid'
// import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage'
import RequisitoModel from 'models/requisito_model'
// import db from "lib/firebase-config";
// db.app
import useSWRImmutable from "swr/immutable"
import useSWR from "swr"
export const getServerSideProps = withPageAuthRequired();
import supabase from "lib/supabase_config";
import { async } from "@firebase/util";
const fetcherTipoDocRequisito = (url: string): Promise<any> =>
    fetch(url, { method: "GET" }).then(r => r.json());
const fetcherTipoDocConsideracion = (url: string): Promise<any> =>
    fetch(url, { method: "GET" }).then(r => r.json());

const formReducer = (state: TipoDocumentoModel, event: any): TipoDocumentoModel => {
    if (event.FORM_DATA) {
        return { ...event.FORM_DATA }
    }
    if (event.FORM_ADD) {
        return new TipoDocumentoModel()
    }
    return { ...state, [event.name]: event.value }
}

export default function AxGrupo({ ID, setID, setEstadoEdicion }: TypeFormularioProps) {
    const { data: listaTipoDocRequisito } = useSWR<any[]>('/api/documento/solicitud/v_tipo_doc_requisito', fetcherTipoDocRequisito);
    const { data: listaTipoDocConsideracion } = useSWR<any[]>('/api/documento/solicitud/v_tipo_doc_consideracion', fetcherTipoDocConsideracion);
    const [formData, setFormData] = useReducer(formReducer, new TipoDocumentoModel());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [tipoEdicion, setTipoEdicion] = useState(EnumTipoEdicion.VISUALIZAR)
    const [open, setOpen] = useState(false)
    const [clicVisualizarArchivo, setClicVisualizarArchivo] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [urlArchivo, setUrlArchivo] = useState("")
    const [archivo, setArchivo] = useState("")
  
    useEffect(() => {
        setIsLoading(true)
        setClicVisualizarArchivo(false)
        setTipoEdicion(ID == 0 ? EnumTipoEdicion.AGREGAR : EnumTipoEdicion.VISUALIZAR);
        if (ID == 0) {
            setFormData({ FORM_ADD: true })
        }
        else {
            const fetchData = async () => {
                const response = await fetch(`/api/documento/tipo_documento/${ID}`);
                const data: RequisitoModel = await response.json();
                setFormData({ FORM_DATA: data });
            }
            fetchData().catch(console.error);
        }
        setIsLoading(false)
    }, [ID])
    const handleChange = (event: any) => {
        const isCheckbox = event.target.type === 'checkbox';
        setFormData({
            name: event.target.name,
            value: isCheckbox ? event.target.checked : event.target.value,
        });
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setIsSubmitting(true);
        const dataEnvio = JSON.stringify(formData);
        const response = await fetch('/api/documento/tipo_documento', {
            body: dataEnvio,
            headers: { 'Content-Type': 'application/json', },
            method: tipoEdicion == EnumTipoEdicion.EDITAR ? "PUT" : tipoEdicion == EnumTipoEdicion.ELIMINAR ? "DELETE" : "POST"
        })

        const result: RequisitoModel = await response.json()
        if (tipoEdicion == EnumTipoEdicion.AGREGAR) setID(result.id);
        setIsSubmitting(false);
        setOpen(false);
        if (tipoEdicion == EnumTipoEdicion.ELIMINAR) setID(-1);
        setTipoEdicion(EnumTipoEdicion.VISUALIZAR)
        setEstadoEdicion(EnumEstadoEdicion.GUARDADO);
    }

    async function FndescargarImg() {
        console.log(archivo);
        
        try {
            if (archivo) {
                const { signedURL, error } = await supabase.storage.from('archivo-requisito').createSignedUrl(archivo, 60)
                if (error) {
                    throw error
                }
                if (signedURL) {
                    window.open(signedURL, "_blank")?.focus();
                }
            }
        } catch (error: any) {
            console.log('Error downloading image: ', error.message)
        }
    }


    async function subirArchivo(event: any) {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }
            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            let { error: uploadError } = await supabase.storage.from('archivo-requisito').upload(filePath, file)
            if (uploadError) {
                throw uploadError
            }
            setFormData({ name: 'url_imagen', value: fileName })
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }
    useEffect(() => {
        FndescargarImg()
    }, [archivo])
    return (
        <>
            <nav className="flex items-start pb-1 sm:hidden" aria-label="Breadcrumb">
                <button
                    onClick={() => { setEstadoEdicion(EnumEstadoEdicion.CANCELADO); }}
                    className="hover:bg-indigo-200 rounded-sm p-2 inline-flex items-center space-x-3 text-sm font-medium text-gray-900">
                    <ChevronLeftIcon className="-ml-2 h-5 w-5 text-indigo-700" aria-hidden="true" />
                    <span>Tipo de documento</span>
                </button>
            </nav>
            <div className={isLoading ? "animate-pulse" : "" + " flex h-full flex-col  bg-white shadow-xl"}>
                <div className="divide-y divide-gray-200">
                    {/*PORTADA*/}
                    <div className="pb-2">
                        <div className="h-6 bg-indigo-700 rounded-md">
                        </div>
                        <div className="-mt-6 flex items-end px-6">
                            {/*CABECERA*/}
                            <div className="ml-6 flex-1">
                                <div className="-">
                                    <h3 className="font-bold text-md text-white ">{formData.nombre ? formData.nombre : "..."}  </h3>
                                </div>
                                {/*AREA DE EDICIÓN*/}
                            </div>
                        </div>
                    </div>
                    {/*FORMULARIO*/}
                    <div className="px-0 py-0">
                        <div className="p-2 md:p-6">
                            <form className="space-y-2 divide-y divide-gray-200" onSubmit={handleSubmit}>
                                <fieldset disabled={tipoEdicion == EnumTipoEdicion.VISUALIZAR} className="space-y-2 divide-y divide-gray-200">
                                    <div className="">
                                        <div>
                                            <h3 className="font-semibold text-lg leading-6 text-gray-900">Descripción </h3>
                                        </div>
                                        <div className="mt-2 grid grid-cols-1 gap-y-2 gap-x-4 md:grid-cols-6">
                                            <div className="md:col-span-2">
                                               <p className="ml-2 font-san text-slate-700	">{formData.descripcion}</p>
                                            </div>                                            
                                        </div>
                                    </div>
                                    <div className="">
                                        <div>
                                            <h3 className="font-semibold text-lg leading-6 text-gray-900">Tiempo Entrega </h3>
                                        </div>
                                        <div className="mt-2 grid grid-cols-1 gap-y-2 gap-x-4 md:grid-cols-6">
                                            <div className="md:col-span-2">
                                               <p className="ml-2 font-san text-slate-700	">{formData.tiempo_entrega} dias</p>
                                            </div>                                            
                                        </div>
                                    </div>
                                    <div className="">
                                        <div>
                                            <h3 className="font-semibold text-lg leading-6 text-gray-900">Costo </h3>
                                        </div>
                                        <div className="mt-2 grid grid-cols-1 gap-y-2 gap-x-4 md:grid-cols-6">
                                            <div className="md:col-span-2">
                                               <p className="ml-2 font-san text-slate-700	">S/ {formData.costo}</p>
                                            </div>                                            
                                        </div>
                                    </div>
                                </fieldset>
                                <div className="mt-2 grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-6">
                                    <div className="md:col-span-6">
                                        <h2 className="font-semibold text-lg">Listado de requisitos</h2>
                                        <ul key={"requisito"} role="list" className="divide-y divide-gray-200">
                                            {listaTipoDocRequisito && listaTipoDocRequisito.filter(item => item.id_tipo_documento == formData.id).map((item: any) =>
                                                <li onClick={() => {
                                                    setArchivo(item.imagen)
                                                }}
                                                    key={item.id}
                                                    className="relative bg-whitecursor-pointer ml-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 "
                                                >
                                                    <div className="flex justify-between space-x-3">
                                                        <div className="min-w-0 flex-1 cursor-pointer">
                                                            <p className="mt-2 flex items-center text-[15px] text-gray-500 font-sans italic">
                                                               - {item.nombre_requisito}
                                                                <LinkIcon className="flex-shrink-0 ml-2 h-4 w-4 text-blue-500" aria-hidden="true" />
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="md:col-span-6">
                                        <h2 className="font-semibold text-lg">Consideraciones</h2>
                                        <ul key={"consideracion"} role="list" className="divide-y divide-gray-200">
                                            {listaTipoDocConsideracion && listaTipoDocConsideracion.filter(item => item.id_tipo_documento == formData.id).map((item: any) =>
                                                item.id_tipo_documento == 1 &&
                                                <li
                                                    key={item.nombre_consideracion}
                                                    className="relative bg-white  hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600"
                                                >
                                                    <div className="flex justify-between space-x-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="mt-2 ml-4 flex items-center text-[15px] text-gray-600  font-sans">
                                                                <CheckIcon className="flex-shrink-0 mr-1 h-4 w-4 text-green-600" aria-hidden="true" />
                                                                {item.nombre_consideracion}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>




                                
                            </form >
                        </div >
                    </div>
                </div>
            </div>
        </>
    )
}


