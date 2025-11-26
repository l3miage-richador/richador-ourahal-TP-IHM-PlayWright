// Scénario d'un ajout d'une tâche à la todo list
import { test, expect, Page } from '@playwright/test';
import {
	addTodoUsingMainInput,
	addTodoUsingStep2Input,
	getTodosFromMainList,
	getTodosFromStep2List,
	countRemaining,
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

    // Lorsque l'utilisateur ajoute plusieurs tâches rapidement
    // Alors toutes les tâches sont ajoutées correctement dans les deux listes
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

    // Lorsque l'utilisateur ajoute une tâche vérifier que la phrase "nombreTache restantes" est mise à jour correctement
	test('Ajouter une tâche met à jour le compteur de tâches restantes', async ({ page }) => {
		const before = await countRemaining(page);
		const text = `counter-${Date.now()}`;
		await addTodoUsingMainInput(page, text);
		// attendre que le DOM mette à jour le compteur (poll)
		await expect.poll(async () => {
			const txt = await page.locator('xpath=//span[contains(@class,\'todo-count\')]//strong').innerText();
			return parseInt(txt || '0', 10);
		}, { timeout: 2000 }).toBe(before + 1);
		const after = await countRemaining(page);
		expect(after).toBe(before + 1);
	});

	// Lorsque l'utilisateur plusieurs tâches vérifier que la phrase "nombreTache restantes" est mise à jour correctement
	test('Ajouter plusieurs tâches met à jour correctement le compteur de tâches restantes', async ({ page }) => {
		const before = await countRemaining(page);
		const tasks = Array.from({ length: 4 }, (_, i) => `multi-counter-${i}-${Date.now()}`);

		for (const t of tasks) {
			await addTodoUsingMainInput(page, t);
		}

		// attendre que le compteur augmente du nombre de tâches ajoutées
		await expect.poll(async () => {
			return await countRemaining(page);
		}, { timeout: 3000 }).toBe(before + tasks.length);

		const after = await countRemaining(page);
		expect(after).toBe(before + tasks.length);
	});

	// Lorsque l'utilisateur ajoute une tâche
	// Alors la tâche est ajoutée en haut des deux listes
	test('Ajouter une tâche => la tâche apparaît en haut de la liste principale', async ({ page }) => {
		const text2 = `top-${Date.now()}`;
		const text1 = `bottom-${Date.now()}`;
		// ajouter d'abord text1 puis text2 -> text2 doit être en tête
		await addTodoUsingMainInput(page, text1);
		await addTodoUsingMainInput(page, text2);

		const main = await getTodosFromMainList(page);
		// s'assurer qu'il y a au moins deux entrées et que la première correspond à text2
		expect(main.length).toBeGreaterThanOrEqual(2);
		expect(main[0]).toBe(text2);
		expect(main[1]).toBe(text1);

		// Vérifier que l'input associé au premier item est bien le champ d'édition (text2 / name=newTextInput)
		const firstItemEditInput = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']/li)[1]//input[@name='newTextInput']");
		expect(await firstItemEditInput.count()).toBeGreaterThan(0);
		const inputName = await firstItemEditInput.first().getAttribute('name');
		expect(inputName).toBe('newTextInput');

		// S'assurer que le premier item n'a pas l'input principal (text1 / name=newTodoInput)
		const firstItemMainInput = page.locator("xpath=(//section[contains(@class,'todoapp')]//ul[@class='todo-list']/li)[1]//input[@name='newTodoInput']");
		expect(await firstItemMainInput.count()).toBe(0);
	});
});