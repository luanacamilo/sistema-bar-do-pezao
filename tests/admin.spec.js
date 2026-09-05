import { test, expect } from '@playwright/test'

test('leitura pública, autorização, CRUD e logout (API simulada)', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  let allowed = true
  let sections = [{ id: 1, nome: 'Porções', slug: 'porcoes', descricao: '', ordem: 0 }]
  let products = [{ id: 1, id_secao: 1, nome: 'Bauru', descricao: '', preco: 22.9, ordem: 0, ic_disponivel: true, destaque: '' }]
  const writes = []
  await page.route('https://*.supabase.co/**', async route => {
    const req = route.request(), url = new URL(req.url())
    let result = {}
    if (url.pathname.endsWith('/token')) result = { access_token: 'test-access-token', token_type: 'bearer', expires_in: 3600, refresh_token: 'test-refresh', user: { id: '11111111-1111-4111-8111-111111111111', email: 'admin@test.com', aud: 'authenticated' } }
    else if (url.pathname.endsWith('/is_cardapio_admin')) result = allowed
    else if (/\/(secao|produto)$/.test(url.pathname)) {
      const section = url.pathname.endsWith('/secao')
      const rows = section ? sections : products
      if (req.method() === 'GET') result = rows
      else {
        writes.push(req.method())
        const id = Number(url.searchParams.get('id')?.replace('eq.', ''))
        const value = req.postDataJSON()
        if (value?.id_secao) value.id_secao = Number(value.id_secao)
        if (req.method() === 'POST') { result = { id: 2, ...value }; rows.push(result) }
        else if (req.method() === 'PATCH') { const index = rows.findIndex(row => row.id === id); rows[index] = { ...rows[index], ...value }; result = rows[index] }
        else { result = { id }; if (section) sections = rows.filter(row => row.id !== id); else products = rows.filter(row => row.id !== id) }
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) })
  })
  await page.goto('/cardapio')
  await expect(page.locator('.catalog-item h3')).toHaveText('Bauru')
  await page.goto('/admin/painel')
  await expect(page).toHaveURL(/admin\/login$/)
  async function login() {
    await page.locator('[name=email]').fill('admin@test.com')
    await page.locator('[name=password]').fill('ExamplePassword123!')
    await page.locator('form button').click()
  }
  await login()
  await expect(page).toHaveURL(/admin\/painel$/)
  await page.locator('.admin-product').getByRole('button', { name: 'Editar', exact: true }).click()
  await page.locator('[name=preco]').fill('25.50')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.locator('.admin-product')).toContainText('25,50')
  await page.getByRole('button', { name: 'Adicionar produto', exact: true }).click()
  await page.locator('[name=nome]').fill('Novo produto')
  await page.locator('[name=preco]').fill('12')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Alteração salva.')
  page.on('dialog', dialog => dialog.accept())
  await page.locator('.admin-product').first().getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Registro excluído.')
  expect(writes).toEqual(['PATCH', 'POST', 'DELETE'])
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page).toHaveURL(/admin\/login$/)
  allowed = false
  await login()
  await expect(page.getByRole('alert')).toContainText('não tem permissão')
  await page.goto('/admin/painel')
  await expect(page).toHaveURL(/admin\/login$/)
  expect(errors).toEqual([])
})
