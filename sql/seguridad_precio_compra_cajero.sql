-- Ocultar precio de compra para usuarios con rol cajero en RPC de productos.
-- Ejecutar en Supabase SQL Editor.

create or replace function public.es_cajero_actual()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.usuarios u
    join public.roles r on r.id = u.id_rol
    where u.id_auth::uuid = auth.uid()
      and lower(coalesce(r.nombre, '')) like '%cajero%'
  );
$$;

create or replace function public.mostrarproductos_seguro(
  _id_empresa bigint,
  _id_sucursal bigint default 0
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Firma: mostrarproductos(bigint)
  if to_regprocedure('public.mostrarproductos(bigint)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.mostrarproductos(_id_empresa) t;
    return;
  end if;

  -- Firma: mostrarproductos(bigint, bigint)
  if to_regprocedure('public.mostrarproductos(bigint,bigint)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.mostrarproductos(_id_empresa, _id_sucursal) t;
    return;
  end if;

  -- Firma: mostrarproductos(bigint, integer)
  if to_regprocedure('public.mostrarproductos(bigint,integer)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.mostrarproductos(_id_empresa, _id_sucursal::integer) t;
    return;
  end if;

  raise exception 'No existe una firma compatible para public.mostrarproductos';
end;
$$;

create or replace function public.buscarproductos_seguro(
  _id_empresa bigint,
  _id_sucursal bigint,
  buscador text
)
returns setof jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Firma: buscarproductos(bigint, bigint, text)
  if to_regprocedure('public.buscarproductos(bigint,bigint,text)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.buscarproductos(_id_empresa, _id_sucursal, buscador) t;
    return;
  end if;

  -- Firma: buscarproductos(bigint, integer, text)
  if to_regprocedure('public.buscarproductos(bigint,integer,text)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.buscarproductos(_id_empresa, _id_sucursal::integer, buscador) t;
    return;
  end if;

  -- Firma: buscarproductos(bigint, text)
  if to_regprocedure('public.buscarproductos(bigint,text)') is not null then
    return query
    select
      case
        when public.es_cajero_actual()
          then to_jsonb(t) - 'precio_compra' - 'p_compra'
        else to_jsonb(t)
      end
    from public.buscarproductos(_id_empresa, buscador) t;
    return;
  end if;

  raise exception 'No existe una firma compatible para public.buscarproductos';
end;
$$;

grant execute on function public.es_cajero_actual() to authenticated;
grant execute on function public.mostrarproductos_seguro(bigint, bigint) to authenticated;
grant execute on function public.buscarproductos_seguro(bigint, bigint, text) to authenticated;
