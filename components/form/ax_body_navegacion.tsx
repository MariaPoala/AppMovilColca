import { navigation } from '../layout/ax_menu_item'
import Link from 'next/link'
import useSWRImmutable from "swr/immutable"
import { useRouter } from 'next/router'
import { NombreTramite } from 'lib/edicion';
import { Dialog, Disclosure, Transition } from '@headlessui/react'
const fetcherGrupo = (url: string): Promise<any> =>
    fetch(url, { method: "GET" }).then(r => r.json());
function classNames(...classes: Array<string>) {
    return classes.filter(Boolean).join(' ')
}

export default function AxBodyNavegacion({ clase }: any) {
    const { data: listaGrupo } = useSWRImmutable('/api/administracion/grupo', fetcherGrupo);
    const router = useRouter();
    return <nav className="mt-5 flex-1 flex flex-col divide-y divide-indigo-500 overflow-y-auto" aria-label="Sidebar">
        <div className="px-2 space-y-1">
            {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                    <a
                        href={item.href}
                        className={classNames(
                            router.pathname == item.href
                                ? 'bg-indigo-800 text-white'
                                : 'text-indigo-100 hover:bg-indigo-500',
                            'group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md hover:text-white hover:bg-indigo-500  focus:ring-indigo-500'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                    >
                        <item.icon className="mr-4 flex-shrink-0 h-6 w-6 text-indigo-200" aria-hidden="true" />
                        {item.name}
                    </a>
                </Link>
            )
            )}
        </div>
    </nav>;
}


