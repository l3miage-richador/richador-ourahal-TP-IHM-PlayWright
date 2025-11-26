// Scénario d'un ajout d'une tâche à la todo list
import { test, expect, Page } from '@playwright/test';
import {
	addTodoUsingMainInput,
	addTodoUsingStep2Input,
	getTodosFromMainList,
	getTodosFromStep2List,
} from './IUtilsFunctions';

const URL = 'https://alexdmr.github.io/l3m-2023-2024-angular-todolist/';

test.describe('Ajout de tâches - Scénarios', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(URL);
	});

    // Lorsque l'utilisateur ajoute une tâche dans la todo list principale
    // Alors la tâche apparaît dans la liste principale et la liste de l'étape 2
	test('Ajouter une tâche via le champ principal => visible dans principale et Étape 2', async ({ page }) => {
		const text = `task-main-${Date.now()}`;
		await addTodoUsingMainInput(page, text);

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		expect(main).toContain(text);
		expect(step2).toContain(text);
	});

    // Lorsque l'utilisateur ajoute une tâche dans l'Étape 2
    // Alors la tâche apparaît dans la liste de l'étape 2 et la liste principale
	test("Ajouter une tâche via l'input Étape 2 => visible dans Étape 2 et principale", async ({ page }) => {
		const text = `task-step2-${Date.now()}`;
		await addTodoUsingStep2Input(page, text);

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		expect(step2).toContain(text);
		expect(main).toContain(text);
	});

    // Lorsque l'utilisateur ajoute une tâche vide
    // Alors aucune tâche n'est ajoutée dans les deux listes
	test('Ajouter une tâche vide n ajoute rien', async ({ page }) => {
		const beforeMain = await getTodosFromMainList(page);
		const beforeStep2 = await getTodosFromStep2List(page);

		await addTodoUsingMainInput(page, '');
		await addTodoUsingStep2Input(page, '');

		const afterMain = await getTodosFromMainList(page);
		const afterStep2 = await getTodosFromStep2List(page);

		expect(afterMain.length).toBe(beforeMain.length);
		expect(afterStep2.length).toBe(beforeStep2.length);
	});


    // Lorsque l'utilisateur ajoute une tâche avec uniquement des espaces
    // Alors aucune tâche n'est ajoutée dans les deux listes
	test('Ajouter une tâche composée uniquement d espaces n ajoute rien', async ({ page }) => {
		const beforeMain = await getTodosFromMainList(page);
		const beforeStep2 = await getTodosFromStep2List(page);

		await addTodoUsingMainInput(page, '   ');
		await addTodoUsingStep2Input(page, '      ');

		const afterMain = await getTodosFromMainList(page);
		const afterStep2 = await getTodosFromStep2List(page);

		expect(afterMain.length).toBe(beforeMain.length);
		expect(afterStep2.length).toBe(beforeStep2.length);
	});

    // Lorsque l'utilisateur ajoute une tâche avec uniquement des caractères speciaux
    // Alors aucune tâche n'est ajoutée dans les deux listes
	test('Ajouter une tâche composée uniquement de caractères spéciaux n ajoute rien', async ({ page }) => {
		const beforeMain = await getTodosFromMainList(page);
		const beforeStep2 = await getTodosFromStep2List(page);

		await addTodoUsingMainInput(page, '!!!@@@###');
		await addTodoUsingStep2Input(page, '%%%^^^&&&');

		const afterMain = await getTodosFromMainList(page);
		const afterStep2 = await getTodosFromStep2List(page);

		expect(afterMain.length).toBe(beforeMain.length);
		expect(afterStep2.length).toBe(beforeStep2.length);
	});

    // Lorsque l'utilisateur ajoute une tâche très longue (de plus de 50 caractères)
    // Alors l'input se bloque peut importe la liste dans laquelle l'utilisateur ajoute la tâche
	test('Tâche très longue (>50) : l input bloque / n accepte pas plus de 50 caractères', async ({ page }) => {
		const long = 'x'.repeat(60);
		const input = page.locator("xpath=//section[contains(@class,'todoapp')]//input[@class='new-todo']");
		await input.fill(long);

		const value = await input.evaluate((el: HTMLInputElement) => el.value);
		expect(value.length).toBeLessThanOrEqual(50);
	});

    // Lorsque l'utilisateur ajoute une tâche avec des caractères spéciaux
    // Alors la tâche est ajoutée correctement dans les deux listes
	test('Ajouter une tâche avec caractères spéciaux est accepté', async ({ page }) => {
		const text = `tâche-#1-${Date.now()}-!@€`;
		await addTodoUsingMainInput(page, text);

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		expect(main).toContain(text);
		expect(step2).toContain(text);
	});

    // Lorsque l'utilisateur ajoute une tâche avec des accents
    // Alors la tâche est ajoutée correctement dans les deux listes
	test('Ajouter une tâche avec accents est accepté', async ({ page }) => {
		const text = `Tâche-éàç-${Date.now()}`;
		await addTodoUsingMainInput(page, text);

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		expect(main).toContain(text);
		expect(step2).toContain(text);
	});

    // Lorsque l'utilisateur ajoute une tâche avec des emojis
    // Alors la tâche est ajoutée correctement dans les deux listes
	test('Ajouter une tâche avec emojis est accepté', async ({ page }) => {
		const text = `Emoji-🎉😃-${Date.now()}`;
		await addTodoUsingMainInput(page, text);

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		expect(main).toContain(text);
		expect(step2).toContain(text);
	});

    
	test('Ajouter plusieurs tâches rapidement => toutes présentes', async ({ page }) => {
		const tasks = Array.from({ length: 5 }, (_, i) => `quick-${i}-${Date.now()}`);

		for (const t of tasks) {
			// enchaîner rapidement
			await addTodoUsingMainInput(page, t);
		}

		const main = await getTodosFromMainList(page);
		const step2 = await getTodosFromStep2List(page);

		for (const t of tasks) {
			expect(main).toContain(t);
			expect(step2).toContain(t);
		}
	});
});