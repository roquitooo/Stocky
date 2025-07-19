import Swal from 'sweetalert2';
import { supabase } from '../index';

export async function InsertarCategorias(p, file) {
    const { error, data } = await supabase.rpc('insertarcategoria', p);
    if (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message,
    });
    }
    const nuevo_id = data;
    

}

async function subirImagen(){
    const avatarFile = event.target.files[0];
    const { data, error } = await supabase.storage
    .from('categorias')
    .upload("public/avatar1.png", avatarFile, {
        cacheControl: '3600',
        upsert: false,
    })
}