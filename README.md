# Urza's Grimoire

>"Books can be replaced; a prize student cannot. Be patient."
>~Urza, to Barrin

Urza's Grimoire is a simple deck building tool for Magic: The Gathering. It is a 'PWA' (progressive web application) built with 'react.js' and springboot.
The database is 'mongo' but there will be more connectors in the future. The card information comes from 'mtg.wtf'.

Test the app : [https://manascrewd.herokuapp.com](https://manascrewd.herokuapp.com)


# Todo
- [x] Custom navigation actions
- [x] "Delete deck" link in deck fab
- [x] Show mana cost in card info
- [x] Show mana symbol in card oracle
- [ ] Validate cards at deck creation
- [ ] Do not allow empty deck names at creation
- [ ] Update deck model to reference cards and not strings
- [ ] Create a welcome page (example: [https://magicthegathering.io/](magicthegathering.io))
- [ ] Stash API
- [ ] Swagger
- [ ] Add card to collection
- [ ] PWA
- [ ] Implement search
- [ ] Handle dual sided cards
- [ ] Slideshow when click on image
- [ ] Custom theme (Oketra, Hazoret, Rhonas, Kefnet, Bontu)
- [ ] Add card to deck
- [ ] Mozaic background for deck view
- [ ] Filter returned fields in API with ?fields=a,b,c
- [ ] Search API (by name, by type, by mana cost, by color)
- [ ] User API
- [ ] Authentication
- [ ] Card collections API
- [ ] Return exceptions as REST responses
- [ ] Correct logging
- [ ] i18n

# Release notes

## v0.07
- ui cleanup (part3)
- Show mana symbol in card oracle
- "Delete deck" link in deck fab

## v0.06
- ui cleanup (part2)
- custom navigation actions

## v0.05
- minor modification
- ui cleanup (part1)

## v0.04
- major ui fixes
- implement deck delete
- use repositories in React
- view card
- view flip card
- update navigation bar
- handle titles updates with events
- show mana symbols

## v0.03
- mongo db backend
- navigation fixes


## v0.02
- deck creation
- v0.02 api to CR decks

## v0.01
- materialze css frontend
- v0.01 api to retrieve cards
- hardcoded deck