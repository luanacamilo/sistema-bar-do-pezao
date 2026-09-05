import { supabase } from './supabaseClient'

export async function fetchMenu({ admin = false } = {}) {
  let products = supabase.from('produto').select('id,id_secao,nome,descricao,preco,ic_disponivel,destaque,ordem').order('ordem').order('id')
  if (!admin) products = products.eq('ic_disponivel', true)
  const [sectionsResult, productsResult] = await Promise.all([
    supabase.from('secao').select('id,nome,slug,descricao,ordem').order('ordem').order('id'), products,
  ])
  if (sectionsResult.error) throw sectionsResult.error
  if (productsResult.error) throw productsResult.error
  return { sections: sectionsResult.data, products: productsResult.data }
}

export async function checkAdmin() {
  const { data, error } = await supabase.rpc('is_cardapio_admin')
  if (error) throw error
  return data === true
}

async function write(table, value, id) {
  if (!await checkAdmin()) throw new Error('Acesso não autorizado.')
  const request = id == null ? supabase.from(table).insert(value) : supabase.from(table).update(value).eq('id', id)
  const { data, error } = await request.select().single()
  if (error) throw error
  return data
}
async function remove(table, id) {
  if (!await checkAdmin()) throw new Error('Acesso não autorizado.')
  const { data, error } = await supabase.from(table).delete().eq('id', id).select('id').single()
  if (error) throw error
  return data
}
export const saveSection = (value, id) => write('secao', value, id)
export const saveProduct = (value, id) => write('produto', value, id)
export const deleteSection = id => remove('secao', id)
export const deleteProduct = id => remove('produto', id)
