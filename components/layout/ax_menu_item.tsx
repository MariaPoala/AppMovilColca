import {
    CogIcon, FingerPrintIcon, DocumentReportIcon, XIcon,
    HomeIcon, UserIcon, UserGroupIcon, DocumentDuplicateIcon, OfficeBuildingIcon,
    CloudUploadIcon, DocumentTextIcon, DuplicateIcon, DatabaseIcon, CloudIcon,
    UsersIcon, DocumentSearchIcon, IdentificationIcon, LibraryIcon, ClipboardCheckIcon, ClipboardListIcon,
    DesktopComputerIcon, PaperClipIcon
} from '@heroicons/react/outline'
// const fetcherGrupo = (url: string): Promise<any> =>
//     fetch(url, { method: "GET" }).then(r => r.json());
// const { data: listaGrupo } = useSWRImmutable('/api/grupo/edicion', fetcherGrupo);

const navigation = [
    { name: 'Inicio', href: '/', icon: HomeIcon, current: true },
    {
        name: 'Tramites', href: '/documento/tramitesprueba', icon: DesktopComputerIcon, current: false,
    },
    {
        name: 'Mis documentos', href: '/documento/solicitud', icon: DocumentSearchIcon, current: false,
    }
]

export { navigation }

