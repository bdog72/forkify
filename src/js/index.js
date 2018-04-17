import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";

import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listview from "./views/listview";

import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */

//  eslint-disable-next-line
const state = {};

// Search Controller

const controlSearch = async () => {
	// 1) Get query from view
	const query = searchView.getInput();

	if (query) {
		// 2) New search object and add to state
		state.search = new Search(query);

		// 3) Prepare UI for results
		searchView.clearInput();
		searchView.clearResults();
		renderLoader(elements.searchRes);

		try {
			// 4) Search for recipes
			await state.search.getResults();

			// 5) Render results on UI
			clearLoader();

			searchView.renderResults(state.search.result);
		} catch (err) {
			alert("Something wrong with the search...");
			clearLoader();
		}
	}
};

elements.searchForm.addEventListener("submit", e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
	const btn = e.target.closest(".btn-inline");
	if (btn) {
		const goToPage = parseInt(btn.dataset.goto, 10);
		searchView.clearResults();

		searchView.renderResults(state.search.result, goToPage);
	}
});

// Recipe Controller

const controlRecipe = async () => {
	const id = window.location.hash.replace("#", "");
	//  eslint-disable-next-line
	console.log(id);

	if (id) {
		// Prepare UI for changes
		recipeView.clearRecipe();
		renderLoader(elements.recipe);

		// Highlight selected search item
		if (state.search) searchView.highlightSelected(id);

		// Create new recipe object
		state.recipe = new Recipe(id);

		try {
			// Get recipe data
			await state.recipe.getRecipe();
			state.recipe.parseIngredients();

			// Calculate servings and time
			state.recipe.calcTime();
			state.recipe.calcServings();

			// Render recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe);
		} catch (err) {
			alert("error processing recipe");
		}
	}
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach(event =>
	window.addEventListener(event, controlRecipe)
);

// List Controller

const controlList = () => {
	// Create new list if there is none yet
	if (!state.list) state.list = new List();

	// Add each ingredient to the list
	state.recipe.ingredients.forEach(el => {
		const item = state.list.addItem(el.count, el.unit, el.ingredient);
		listview.renderItem(item);
	});
};

// Handling Recipe Button Clicks

elements.recipe.addEventListener("click", e => {
	if (e.target.matches(".btn-decrease, .btn-decrease *")) {
		if (state.recipe.servings > 1) {
			state.recipe.updateServings("dec");
			recipeView.updateServingsIngredients(state.recipe);
		}
	} else if (e.target.matches(".btn-increase, .btn-increase *")) {
		state.recipe.updateServings("inc");
		recipeView.updateServingsIngredients(state.recipe);
	} else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
		controlList();
	}
});

window.l = new List();
