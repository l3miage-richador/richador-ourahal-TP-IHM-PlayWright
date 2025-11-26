import { test, expect } from '@playwright/test';
import {
	addTodoUsingMainInput,
	getTodosFromMainList,
	getTodosFromStep2List,
	editTodoInMainList,
	toggleTodoFromMainList,
	toggleTodoFromStep2List,
	countRemaining,
    editTodoFromStep2,
} from './IUtilsFunctions';

const URL = 'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/';

test.describe('Modification / Toggle des tâches - Scénarios', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(URL);
	});

	// Lorsque clique deux fois sur une tâche de la liste principale
	// Alors la tâche devient éditable dans la liste principale
	test('Double-click rend la tâche éditable dans la liste principale', async ({ page }) => {
		const text = `edit-dbl-${Date.now()}`;
		await addTodoUsingMainInput(page, text);

		const textUpdate = `edited-${Date.now()}`;
		await editTodoInMainList(page, 0, textUpdate);

		// vérifier que le label a bien été mis à jour (attente explicite)
		const label = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//label[@class='texte']");
		await expect(label).toHaveText(textUpdate, { timeout: 3000 });
	});

	// Lorsque l'utilisateur modifie le texte de la tâche et valide dans la liste principale
	// Alors le texte de la tâche est mis à jour dans la liste principale et dans l'Étape 2
	test('Modifier le texte d une tâche met à jour la liste principale et l Etape 2', async ({ page }) => {
		const text = `orig-${Date.now()}`;
		const textUpdate = `upd-${Date.now()}`;
		await addTodoUsingMainInput(page, text);

		// éditer via le helper (remplace et Enter)
		await editTodoFromStep2(page, 0, textUpdate);

		// attendre que le label de la première tâche soit mis à jour
		const label = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//label[@class='texte']");
		await expect(label).toHaveText(textUpdate, { timeout: 5000 });

		// attendre que l'Étape 2 reflète aussi la mise à jour
		await expect.poll(async () => {
			const step2 = await getTodosFromStep2List(page);
			return step2.includes(textUpdate);
		}, { timeout: 5000 }).toBeTruthy();
	});

	// Lorsque l'utilisateur coche une tâche dans la liste principale
	// Alors la tâche est cochée dans la liste principale et dans l'Étape 2
	test('Coche dans la liste principale reflété dans l Etape 2', async ({ page }) => {
		const t = `toggle-main-${Date.now()}`;
		await addTodoUsingMainInput(page, t);

		// cocher
		await toggleTodoFromMainList(page, 0);

		const mainCheckbox = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//input[@type='checkbox']");
		const step2Checkbox = page.locator("xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[1]//input[@type='checkbox']");

		expect(await mainCheckbox.isChecked()).toBeTruthy();
		expect(await step2Checkbox.isChecked()).toBeTruthy();
	});

	// Lorsque l'utilisateur coche une tâche dans la liste de l'Étape 2
	// Alors la tâche est coche dans la liste de l'Étape 2 et dans la liste principale
	test('Coche dans Etape 2 reflété dans la liste principale', async ({ page }) => {
		const t = `toggle-step2-${Date.now()}`;
		await addTodoUsingMainInput(page, t);

		await toggleTodoFromStep2List(page, 0);

		const mainCheckbox = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//input[@type='checkbox']");
		const step2Checkbox = page.locator("xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[1]//input[@type='checkbox']");

		expect(await step2Checkbox.isChecked()).toBeTruthy();
		expect(await mainCheckbox.isChecked()).toBeTruthy();
	});

	// Lorsque l'utilisateur décoche une tâche dans la liste principale
	// Alors la tâche est décochée dans la liste principale et dans l'Étape 2
	test('Décoche dans la liste principale reflété dans Etape 2', async ({ page }) => {
		const t = `untoggle-main-${Date.now()}`;
		await addTodoUsingMainInput(page, t);
		// cocher puis décocher
		await toggleTodoFromMainList(page, 0);
		await toggleTodoFromMainList(page, 0);

		const mainCheckbox = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//input[@type='checkbox']");
		const step2Checkbox = page.locator("xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[1]//input[@type='checkbox']");

		expect(await mainCheckbox.isChecked()).toBeFalsy();
		expect(await step2Checkbox.isChecked()).toBeFalsy();
	});

	// Lorsque l'utilisateur décoche une tâche dans la liste de l'Étape 2
	// Alors la tâche est décochée dans la liste de l'Étape 2 et dans la liste principale
	test('Décoche dans Etape 2 reflété dans la liste principale', async ({ page }) => {
		const t = `untoggle-step2-${Date.now()}`;
		await addTodoUsingMainInput(page, t);
		await toggleTodoFromStep2List(page, 0);
		await toggleTodoFromStep2List(page, 0);

		const mainCheckbox = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li)[1]//input[@type='checkbox']");
		const step2Checkbox = page.locator("xpath=(//h2[text()='Étape 2']/following-sibling::ul[1]//li)[1]//input[@type='checkbox']");

		expect(await step2Checkbox.isChecked()).toBeFalsy();
		expect(await mainCheckbox.isChecked()).toBeFalsy();
	});

	// Lorsque l'utilisateur coche une tâche
	// Alors le compteur de tâches restantes est mis à jour correctement
	test('Coche met à jour le compteur de tâches restantes', async ({ page }) => {
		const t = `count-toggle-${Date.now()}`;
		const before = await countRemaining(page);
		await addTodoUsingMainInput(page, t);
		// le compteur augmente d une unité
		await expect.poll(async () => await countRemaining(page), { timeout: 3000 }).toBe(before + 1);

        await toggleTodoFromMainList(page, 0);
		await expect.poll(async () => await countRemaining(page), { timeout: 3000 }).toBe(before);
	});

	// Lorsque l'utilisateur décoche une tâche
	// Alors le compteur de tâches restantes est mis à jour correctement
	test('Décoche met à jour le compteur de tâches restantes', async ({ page }) => {
		const t = `count-untoggle-${Date.now()}`;
		await addTodoUsingMainInput(page, t);
			const afterAdd = await countRemaining(page);
			// cocher puis décocher
			await toggleTodoFromMainList(page, 0); // cocher
			await expect.poll(async () => await countRemaining(page), { timeout: 3000 }).toBe(afterAdd - 1);
			await toggleTodoFromMainList(page, 0); // décocher
			await expect.poll(async () => await countRemaining(page), { timeout: 3000 }).toBe(afterAdd);
	});

    // Lorsque l'utilisateur clique sur le chevron en haut à gauche de l'input principal
    // Alors toutes les tâches sont cochées dans la liste principale et dans l'Étape 2
	test('Tâche(s) cochée(s) est barrée(s) dans la liste principale et simplement cochée(s) dans l étape 2', async ({ page }) => {
		// ajouter deux tâches puis utiliser le bouton "Mark all as complete"
		const t1 = `strike1-${Date.now()}`;
		const t2 = `strike2-${Date.now()}`;
		await addTodoUsingMainInput(page, t1);
		await addTodoUsingMainInput(page, t2);

		const toggleAll = page.locator("xpath=//label[@for='toggleAll']");
		await toggleAll.waitFor({ state: 'visible', timeout: 3000 });
		await toggleAll.click();

		const items = page.locator("xpath=//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li");
		const cls1 = await items.nth(0).getAttribute('class');
		const cls2 = await items.nth(1).getAttribute('class');
		expect(cls1 && cls1.includes('completed')).toBeTruthy();
		expect(cls2 && cls2.includes('completed')).toBeTruthy();
	});

    // Lorsque l'utilisateur reclique sur le chevron en haut à gauche de l'input principal
    // Alors toutes les tâches sont décochées dans la liste principale et dans l'Étape 2
	test('Tâche(s) décochée(s) est plus barrée(s) dans la liste principale et simplement décochée(s) dans l étape 2', async ({ page }) => {
		// ajouter deux tâches, marquer tout puis décocher via le même bouton
		const t1 = `unstrike1-${Date.now()}`;
		const t2 = `unstrike2-${Date.now()}`;
		await addTodoUsingMainInput(page, t1);
		await addTodoUsingMainInput(page, t2);

		const toggleAll = page.locator("xpath=//label[@for='toggleAll']");
		await toggleAll.waitFor({ state: 'visible', timeout: 3000 });
		// marquer tout
		await toggleAll.click();
		// décocher tout
		await toggleAll.click();

		const items = page.locator("xpath=//section[contains(@class,'todoapp')]//ul[@class='todo-list']//li");
		const cls1 = await items.nth(0).getAttribute('class');
		const cls2 = await items.nth(1).getAttribute('class');
		expect(!cls1 || !cls1.includes('completed')).toBeTruthy();
		expect(!cls2 || !cls2.includes('completed')).toBeTruthy();
	});
});
