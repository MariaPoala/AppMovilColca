import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Mi Aplicacion</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white">
        <div className="relative bg-gray-900">
          <div aria-hidden="true" className=" opacity-75 absolute inset-0 overflow-hidden">
            <img
              src="https://tailwindui.com/img/ecommerce-images/home-page-01-feature-section-01.jpg"
              alt=""
              className="w-full h-full object-center object-cover"
            />
          </div>
          <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />
          <div className="relative max-w-3xl mx-auto py-32 px-6 flex flex-col items-center text-center sm:py-64 lg:px-0">
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white lg:text-6xl">Bienvenido</h1>
            <p className="mt-4 text-xl text-white">
              a la app movil
            </p>
            <h2 className="mt-20 text-xl text-white">Municipalidad distrital de Colca</h2>
            <h3 className="text-xl text-white">Perla heroica del Canipaco</h3>
            <p className="mt-14 text-xl text-white">
              La primera APP movil dirigido a los vecinos del distrito de Colca para informarce sobre los tramites que la municipalidad ofrece y de acceso a sus documentos realizados.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home