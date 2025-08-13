import { useQuery } from "@tanstack/react-query";
import {ConfiguracionesTemplate, useModulosStore} from "../index";

export function Configuraciones() {
    const {mostrarModulos} = useModulosStore();
    const {isLoading, error} = useQuery({
        queryKey: "mostrar modulos", 
        queryFn: mostrarModulos,
    });
    if (isLoading){
    return (<span>Cargando...</span>);
    }
    
    if(error){
        return (<span>Error al cargar los módulos</span>);
    }
    return (<ConfiguracionesTemplate/>);
}
