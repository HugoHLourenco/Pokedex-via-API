const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            searchText: '',
            searchedPokemon: null, 
            nextPage: 1,
        };
    },
    computed: {
        filteredPokemons() {
            return this.pokemons.filter(pokemon =>
                pokemon.name.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    },
    created() {
        this.callAPI();
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        async callAPI() {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.nextPage - 1) * 151}&limit=151`);
                const data = await response.json();
                const pokemonDetailsPromises = data.results.map(async pokemon => this.fetchPokemonData(pokemon.url));
                const pokemonDetails = await Promise.all(pokemonDetailsPromises);
                this.pokemons = [...this.pokemons, ...pokemonDetails];
                this.nextPage++;
                this.loading = false;
            } catch (error) {
                console.error(error);
            }
        },
        async fetchPokemonData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    types: data.types,
                    sprites: data.sprites,
                    showDetails: false,
                };
            } catch (e) {
                console.error(e);
            }
        },
        handleScroll() {
            const bottomOfWindow = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 10;
            if (bottomOfWindow && !this.loading) {
                this.loading = true;
                this.callAPI();
            }
        },
        getPokemonStyle(pokemon) {
            if (pokemon.types.length === 1) {
                return { backgroundColor: this.getTypeColor(pokemon.types[0].type.name) };
            } else {
                const color1 = this.getTypeColor(pokemon.types[0].type.name);
                const color2 = this.getTypeColor(pokemon.types[1].type.name);
                return {
                    background: `linear-gradient(45deg, ${color1} 50%, ${color2} 50%)`
                };
            }
        },
        getTypeColor(type) {
            const typeColorMap = {
                fire: '#c07b0b',
                grass: '#5ca85f',
                water: '#3272fd',
                bug: '#c4e9b8',
                normal: '#cbd0d8',
                poison: '#8045b8',
                electric: '#fff454',
                ground: '#9c8f7c',
                ghost: '#240b66',
                fighting: '#802a3a',
                psychic: '#ffb3b8',
                rock: '#6d5c58',
                ice: '#1bddff',
                steel: '#8190ac',
                dark: '#000000',
                flying: '#9ff1ff',
                fairy: '#fb07ff',
                dragon: '#0b3794',
            };
            return typeColorMap[type] || '#cbd0d8'; 
        },
        async searchPokemon() {
            if (!this.searchText) return; 
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.searchText.toLowerCase()}`);
                if (!response.ok) throw new Error('Pokémon não encontrado');
                const data = await response.json();
                this.searchedPokemon = {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    types: data.types,
                    sprites: data.sprites
                };
            } catch (e) {
                console.error(e);
                alert('Pokémon não encontrado. Tente novamente.');
                this.searchedPokemon = null;
            }
        },
        clearSearch() {
            this.searchText = '';
            this.searchedPokemon = null; 
        }
    }
}).mount("#app");
