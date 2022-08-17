import { useEffect, useReducer, useState } from "react";

import SolicitudModel from 'models/solicitud_model'
import DocumentoModel from "models/documento_model";
import supabase from "lib/supabase_config";
import { EyeIcon, EyeOffIcon, DownloadIcon } from "@heroicons/react/outline";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired()

const formReducer = (state: SolicitudModel, event: any): SolicitudModel => {
    if (event.FORM_DATA) {
        return { ...event.FORM_DATA }
    }
    if (event.FORM_ADD) {
        return new SolicitudModel()
    }
    return { ...state, [event.name]: event.value }
}

export default function AxSolicitudArchivo({ ID }: any) {
    const [formData, setFormData] = useReducer(formReducer, new SolicitudModel());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownload, setIsDownload] = useState(true);
    const [clic, setclic] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [urlArchivo, setUrlArchivo] = useState("")

    useEffect(() => {
        setIsLoading(true)
        setclic(true)
        const fetchData = async () => {
            const response = await fetch(`/api/documento/solicitud/${ID}`);
            const data: SolicitudModel = await response.json();
            setFormData({ FORM_DATA: data });
        }
        fetchData().catch(console.error);
        setIsLoading(false)
    }, [ID])

    useEffect(() => {
        FndescargarImg()
    }, [formData.url_archivo_solicitud])



    async function FndescargarImg() {
        setIsDownload(true);
        try {
            if (formData.url_archivo_solicitud) {
                const { signedURL, error } = await supabase.storage.from('archivo-solicitud').createSignedUrl(formData.url_archivo_solicitud, 60)
                if (error) {
                    throw error
                }
                if (signedURL) {
                    setUrlArchivo(signedURL)
                }
            }
        } catch (error: any) {
            console.log('Error downloading image: ', error.message)
        }
        setIsDownload(false);
    }




    return (
        <>
            <div className={isDownload ? "animate-pulse" : "" + " flex h-full flex-col  bg-white shadow-xl "}>
                {/*PORTADA*/}
                <div className="h-1 mt-1 bg-indigo-700 rounded-sm" />
                {/*FORMULARIO*/}
                <button type="button" className=" border-indigo-300 rounded-xs bg-indigo-100">Descargar</button>
                <div className="px-0 py-0  ">
                    <div className="p-4 md:p-2">
                        {isDownload ?
                            < svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> :
                            <div className="md:col-span-6 mt-6">
                                {clic == true &&
                                    <div className="bg-white">
                                        {urlArchivo ? (
                                            <div className="">
                                                <ul role="list" className="content-start sm:grid sm:grid-cols-1 sm:gap-x-1 sm:gap-y-1 sm:space-y-0 lg:grid-cols-1 lg:gap-x-1">
                                                    <li key={urlArchivo}>
                                                        <img className=" object-cover shadow-lg rounded-lg" src={urlArchivo} alt="" />
                                                    </li>
                                                </ul>
                                            </div>)
                                            :
                                            (
                                                <div className="archivo-requisito no-image" style={{ height: 100, width: 100 }} />
                                            )}

                                    </div>
                                }
                            </div>
                        }
                    </div >
                </div>

            </div >
        </>
    )
}
