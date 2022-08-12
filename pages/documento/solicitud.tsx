
import { Fragment, useEffect, useState } from 'react'
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0";
import useSWRImmutable from "swr/immutable"
import useSWR from "swr"
import { LinkIcon} from '@heroicons/react/outline';
import {  AxInput } from 'components/form';
import { EnumEstadoEdicion, EnumTipoEdicion } from 'lib/edicion';
import SolicitudModel from 'models/solicitud_model'
import supabase from "lib/supabase_config";
export const getServerSideProps = withPageAuthRequired();


const fetcherPersona = (url: string): Promise<any> =>
  fetch(url, { method: "GET" }).then(r => r.json());
const fetcherTipoDocumento = (url: string): Promise<any> =>
  fetch(url, { method: "GET" }).then(r => r.json());

const campos = [
  { name: 'Total' },
  { name: 'Fechas' },
  { name: 'Dias' },
  { name: 'Estado' }
]

const estados = [
  { name: 'REGISTRADO' },
  { name: 'VALIDADO' },
  { name: 'RECHAZADO' },
  { name: 'FINALIZADO' },
  { name: 'ENTREGADO' }
]
type TypeFiltro = {
  tipo_entidad: string
  id_persona: number,
  id_empresa: number,
  year_mes: string,
  cliente: string,
  id_tipo_documento: number[],
  estado: string[],
}

export default function AxPageDocumento() {
  const { user, error, isLoading: isLoadingUser } = useUser();
  const { data: listaTipoDocumento } = useSWR<any[]>('/api/documento/tipo_documento', fetcherTipoDocumento);
  const { data: listaPersona } = useSWRImmutable<any[]>('/api/entidad/persona', fetcherPersona);
  const [ID, setID] = useState(-1)
  const [lista, setLista] = useState<SolicitudModel[]>([]);
  const [estadoEdicion, setEstadoEdicion] = useState(EnumEstadoEdicion.LISTAR)
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<TypeFiltro>({ tipo_entidad: "NATURAL", id_persona: 0, id_empresa: 0, year_mes: '2022-08', id_tipo_documento: [], estado: ["FINALIZADO", "RECHAZADO"], cliente: "" });
  const [listaFiltro, setListaFiltro] = useState<SolicitudModel[]>([]);
  const [archivo, setArchivo] = useState("")
  const [nombreAlmacenamiento, setNombreAlmacenamiento] = useState("")


  useEffect(() => {

    if (estadoEdicion != EnumEstadoEdicion.LISTAR && estadoEdicion != EnumEstadoEdicion.GUARDADO) return;
    setIsLoading(true)
    const fetchData = async () => {
      const response = await fetch(`/api/documento/solicitud/v_solicitud`, {
        method: "GET"
      })
      const result: SolicitudModel[] = await response.json()
      setLista(result);
      setIsLoading(false)
    }
    fetchData().catch(console.error);
  }, [estadoEdicion])

  useEffect(() => {
    FnFiltrarLista();
  }, [lista, filtro])




  const handleChange = (event: any) => {
    if (event.target.name == "FiltroGrupo") {
      const indexAnterior = filtro.id_tipo_documento.indexOf(event.target.value);
      if (indexAnterior != -1) filtro.id_tipo_documento.splice(indexAnterior, 1);
      else filtro.id_tipo_documento.push(event.target.value);
      setFiltro({ ...filtro });
    }
    if (event.target.name == "FiltroEstado") {
      const indexAnterior = filtro.estado.indexOf(event.target.value);
      if (indexAnterior != -1) filtro.estado.splice(indexAnterior, 1);
      else filtro.estado.push(event.target.value);
      setFiltro({ ...filtro });
    }
    else {
      setFiltro({ ...filtro, [event.target.name]: event.target.value });
    }
  }
  const resultado = Array.from(new Set(lista.map(s => s.id_tipo_documento)))
    .map(id => {
      return {
        id: id
      }
    });

  function FnFiltrarLista() {
    let filtrado = lista && lista.filter((item: any) =>
      (filtro.tipo_entidad == item.tipo_entidad) &&
      (item.id_persona == filtro.id_persona) &&
      (filtro.id_tipo_documento.indexOf(item.id_tipo_documento) != -1) &&
      (filtro.estado.indexOf(item.estado) != -1) &&
      (filtro.year_mes ? (item.fecha_inicio.substring(6, 10) + '-' + item.fecha_inicio.substring(3, 5)) == filtro.year_mes : true)
    )
    setListaFiltro(filtrado);
  }



  
  async function FndescargarImg() {
    try {
      if (archivo) {
        const { signedURL, error } = await supabase.storage.from('archivo-' + nombreAlmacenamiento).createSignedUrl(archivo, 60)
        if (error) {
          throw error
        }
        if (signedURL) {
          //PARA ABRIR EN UNA NUEVA PESTAÑA
         const a= document.createElement("a");
         a.href=signedURL;
         a.download=archivo;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a); 

        }
      }
    } catch (error: any) {
      console.log('Error downloading image: ', error.message)
    }
  }
  useEffect(() => {
    FndescargarImg();
  }, [archivo])

  useEffect(() => {
    if (filtro.id_persona > 0) { filtro.id_persona = 0 }
    else if (filtro.id_empresa > 0) { filtro.id_empresa = 0 }

  }, [filtro.tipo_entidad])


  useEffect(() => {
    const persona = listaPersona?.filter(x => x.email == user?.email);
    if (persona && persona[0]) {
      

      setFiltro({ ...filtro, id_persona: persona[0].id })
    }
  }, [listaPersona, user])
  return (
    <>
      {(lista && lista.filter(x=> x.id_persona == filtro.id_persona).length==0) ?
        <h1>No cuenta con documentos</h1> 
        :

        <main className="flex-1 pb-8">
          <div className={(isLoading ? "animate-pulse" : "") + " bg-white shadow"}>
            <div className=" sm:px-4 lg:max-w-6xl ">
              <div className="py-2 lg:border-t lg:border-gray-200">
                <div className="flex-1 min-w-0">
                  <div className="grid ml-4 mr-4 grid-cols-6 gap-y-6 gap-x-4 md:grid-cols-6">
                    <div className="col-span-6">
                      <AxInput name="year_mes" value={filtro.year_mes} label="Periodo" handleChange={handleChange} filtro={true} type="month" />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-500">Estados</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center px-2 ">
              <div className="flex-auto">
                <div className="grid grid-cols-3 gap-2 ml-2 mr-4 place-items-stretch h-6  ">
                  {/* Card */}
                  {(estados.map((item: any) =>
                    <ul key={item.name} className={(item.name == "REGISTRADO" ? " bg-indigo-600 hover:bg-indigo-700  ring-indigo-500"
                      : item.name == "RECHAZADO" ? "bg-red-600 hover:bg-red-700 ring-red-500"
                        : item.name == "VALIDADO" ? "bg-blue-600 hover:bg-blue-700 ring-blue-500"
                          : item.name == "FINALIZADO" ? "bg-black hover:bg-black ring-black"
                            : "bg-green-600 hover:bg-green-700 ring-green-500") + (filtro.estado.indexOf(item.name) != -1 && " ring-2 ring-offset-2 ") + " cursor-pointer font-Times h-5 w-24 inline-flex items-center px-3.5 py-2 border border-transparent text-xs leading-4 font-medium rounded-full shadow-sm text-white  focus:outline-none"}
                      onClick={() => {
                        handleChange({ target: { name: "FiltroEstado", value: item.name } });
                        FnFiltrarLista();
                      }}>
                      {item.name}
                    </ul>
                  )
                  )
                  }
                </div>
              </div>


            </div>
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">Tipo Documento</span>
              </div>
            </div>
            <div className="sm:flex sm:items-center px-4 mt-4">
              <div className="sm:flex-auto">
                <div className="mt-2 grid  gap-5 grid-cols-2 sm:grid-cols-2  md:grid-cols-3  lg:grid-cols-5">
                  {/* Card */}
                  {(listaTipoDocumento && listaTipoDocumento.map((item: any) =>
                  (resultado.map(s => s.id == item.id &&
                    <ul key={item.id} className={(filtro.id_tipo_documento.indexOf(item.id) != -1 ? "bg-indigo-600" : "bg-indigo-400") + "  cursor-pointer overflow-hidden shadow rounded-lg"}
                      onClick={() => {
                        handleChange({ target: { name: "FiltroGrupo", value: item.id } });
                        FnFiltrarLista();
                      }}>

                      <div className=" mt-[2px] mb-1">
                        <div className="flex items-center">
                          <div className="ml-2 w-10 flex-1">
                            <dl>
                              <dt className="text-xs font-medium text-white truncate uppercase">{item.nombre}</dt>
                              {/* <dd>
                            <div className="text-sm font-medium text-indigo-100">{item.Descripcion}</div>
                          </dd> */}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </ul>
                  )))
                  )
                  }
                </div>
              </div>
            </div>
            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">Solicitudes</span>
              </div>
            </div>

          </div>

          <div className="mt-2 flex flex-col">
            <div className="ml-1 mr-1 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300 border-2 border-indigo-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-44 px-2  text-left text-sm font-semibold text-gray-900">
                          Documento
                        </th>
                        <th scope="col" className="w-16 px-2 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th scope="col" className="w-18 px-2  text-left text-sm font-semibold text-gray-900">
                          Fecha
                        </th>
                        <th scope="col" className="w-8 px-2  text-left text-sm font-semibold text-gray-900">
                          Estado
                        </th>
                        <th scope="col" className="w-16 px-2  text-left text-sm font-semibold text-gray-900">
                          Archivo
                        </th>

                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {listaFiltro && listaFiltro.map((item: any) => (
                        <tr key={item.id} className="">
                          <td className="whitespace-nowrap w-44 px-2 text-sm font-medium text-gray-900">
                            <div className="text-gray-900 text-[11px]">{item.tipo_documento_nombre} </div>
                            <div className="text-gray-500">
                              <span className=" text-[11px] whitespace-nowrap flex-shrink-0 inline-block px-2 italic  " >
                                {item.numero_documento}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap w-16 px-2  text-sm text-gray-500">
                            <div className="text-gray-900 text-[11px]">{item.i_total} </div>

                          </td>
                          <td className="whitespace-nowrap w-18 px-2  text-sm text-gray-500">
                            <div className="text-gray-900 text-[11px] ">Inicio: {item.fecha_inicio}</div>
                            <div className="text-gray-500 text-[11px] italic"> Plazo: {item.fecha_plazo}
                              {/* <span className=" text-[11px] whitespace-nowrap flex-shrink-0 inline-block px-2 italic  " >
                              Plazo: {item.fecha_plazo}</span> */}
                            </div>
                          </td>
                          <td className="whitespace-nowrap w-8 px-2  text-sm text-gray-500">
                            <div
                              className={" text-[11px] inline-flex items-center w-20 h-4  px-1 py-1 border disabled:bg-indigo-300  border-gray-300 shadow-sm leading-4 font-medium rounded-md text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 " +
                                (item.estado == "REGISTRADO"
                                  ? "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500 "
                                  : item.estado == "RECHAZADO"
                                    ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                    : item.estado == "VALIDADO"
                                      ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 " :
                                      item.estado == "FINALIZADO"
                                        ? "bg-zinc-500 hover:bg-zinc-600 focus:ring-zinc-500 " :
                                        "bg-green-500 hover:bg-green-600 focus:ring-green-500 ")
                              }
                            >
                              {item.estado}
                            </div>
                          </td>
                          <td className="relative whitespace-nowrap w-16 px-4  text-right text-sm font-medium sm:pr-6">
                            {(item.estado == "FINALIZADO" || item.estado == "ENTREGADO") && item.url_archivo_solicitud != null &&
                              <button type="button"
                                onClick={() => {
                                  setID(item.id)
                                  setArchivo(item.url_archivo_solicitud);
                                  setNombreAlmacenamiento("solicitud")
                                }}
                                className=" inline-flex items-center px-1 py-1 border  h-6 w-6 font-mono italic border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500     disabled:bg-indigo-300"
                              >
                                <LinkIcon className='h-3 w-3'></LinkIcon>
                              </button>
                            }

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main >
      }
    </>
  )
}


