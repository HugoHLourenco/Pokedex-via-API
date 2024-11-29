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
                fire: '#c27e10',
                grass: '#4CAF50',
                water: '#00BFFF',
                bug: '#98e880',
                normal: '#A9A9A9',
                poison: '#9e5cda',
                electric: '#ffd365',
                ground: '#9e7e52',
                ghost: '#5626de',
                fighting: '#ba082a',
                psychic: '#e39fa4',
                rock: '#897975',
                ice: '#42bed3',
                steel: '#999999',
                dark: '#12124f',
                flying: '#23f1c7',
                fairy: '#f040f3',
                dragon: '#3263cc',
            };
            return typeColorMap[type] || '#A9A9A9'; 
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
