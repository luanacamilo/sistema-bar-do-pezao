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
      if (req.method() === 'GET') {
        expect(url.searchParams.get('select') || '').not.toContain('is_esgotado')
        result = url.searchParams.get('ic_disponivel') === 'eq.true' ? rows.filter(row => row.ic_disponivel) : rows
      }
      else {
        writes.push(req.method())
        const id = Number(url.searchParams.get('id')?.replace('eq.', ''))
        const value = req.postDataJSON()
        expect(value || {}).not.toHaveProperty('is_esgotado')
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
  await expect(page.locator('.admin-product')).toHaveCount(1)
  await page.getByRole('button', { name: 'Minimizar Porções', exact: true }).click()
  await expect(page.locator('.admin-product')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Adicionar produto', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Expandir Porções', exact: true }).press('Enter')
  await expect(page.locator('.admin-product')).toBeVisible()
  await page.getByRole('button', { name: 'Minimizar Porções', exact: true }).click()
  await page.getByLabel('Buscar produto ou seção').fill('Bauru')
  await expect(page.locator('.admin-product')).toBeVisible()
  await page.getByLabel('Buscar produto ou seção').fill('inexistente')
  await expect(page.getByRole('heading', { name: 'Nenhum produto encontrado' })).toBeVisible()
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await page.getByRole('button', { name: 'Esgotados', exact: true }).click()
  await expect(page.locator('.admin-product')).toHaveCount(0)
  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    await page.screenshot({ path: `test-results/admin-layout-${width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Marcar como esgotado', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Produto marcado como esgotado.')
  expect(products[0].ic_disponivel).toBe(false)
  await page.goto('/cardapio')
  await expect(page.locator('.catalog-sold-out-banner')).toHaveText('Esgotado')
  await expect(page.locator('.catalog-item h3')).toHaveText('Bauru')
  await page.screenshot({ path: 'test-results/produto-esgotado-mobile.png', fullPage: true })
  await page.goto('/admin/painel')
  await page.getByRole('button', { name: 'Marcar como disponível', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Produto disponível novamente.')
  expect(products[0].ic_disponivel).toBe(true)
  await page.goto('/cardapio')
  await expect(page.locator('.catalog-item h3')).toHaveText('Bauru')
  await expect(page.locator('.catalog-sold-out-banner')).toHaveCount(0)
  await page.goto('/admin/painel')
  writes.length = 0
  await page.locator('.admin-product').getByRole('button', { name: 'Editar', exact: true }).click()
  await expect(page.locator('[name=preco]')).toHaveValue('22,90')
  await page.locator('[name=preco]').fill('123456')
  await expect(page.locator('[name=preco]')).toHaveValue('1.234,56')
  await page.locator('[name=preco]').fill('2550')
  await expect(page.locator('[name=preco]')).toHaveValue('25,50')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.locator('.admin-product')).toContainText('25,50')
  await page.getByRole('button', { name: 'Adicionar produto', exact: true }).click()
  await page.locator('[name=nome]').fill('Novo produto')
  await page.locator('[name=preco]').fill('1200')
  await expect(page.locator('[name=preco]')).toHaveValue('12,00')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Alteração salva.')
  await page.locator('.admin-product').first().getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Bauru')
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  expect(writes).toEqual(['PATCH', 'POST'])
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('.admin-product').first().getByRole('button', { name: 'Excluir', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('.admin-product').first().getByRole('button', { name: 'Excluir', exact: true }).click()
  await page.screenshot({ path: 'test-results/confirmacao-excluir-mobile.png' })
  await page.getByRole('button', { name: 'Sim, excluir', exact: true }).click()
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
