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
- [x] Implement search
- [x] Slideshow when click on image
- [ ] Animations on components
- [ ] Consistent menus
- [ ] Mobile/Desktop view with sidmenu  
- [ ] Implement card ordering in deck
- [ ] Validate cards at deck creation
- [ ] Deck stats
- [ ] Deck CMC
- [ ] Deck colors
- [ ] Do not allow empty deck names at creation
- [ ] Update deck model to reference cards and not strings
- [ ] Create a welcome page (example: [https://magicthegathering.io/](magicthegathering.io))
- [ ] Application shell
- [ ] Stash API
- [ ] Swagger
- [ ] Add card to collection
- [ ] PWA
- [ ] Handle dual sided cards
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
## v0.09
- [x] Splash page
- [x] Implement search
- [x] Fix navigation issue on card info page
- [x] Deck image preview in deck list

## v0.08
- [x] ui cleanup (part4)
- [x] Show icons in navigation
- [x] Handle functions as links in navigation
- [x] Add lightbox to show cards in deck detail view

## v0.07
- [x] ui cleanup (part3)
- [x] Show mana symbol in card oracle
- [x] "Delete deck" link in deck fab

## v0.06
- [x] ui cleanup (part2)
- [x] custom navigation actions

## v0.05
- [x] minor modification
- [x] ui cleanup (part1)

## v0.04
- [x] major ui fixes
- [x] implement deck delete
- [x] use repositories in React
- [x] view card
- [x] view flip card
- [x] update navigation bar
- [x] handle titles updates with events
- [x] show mana symbols

## v0.03
- [x] mongo db backend
- [x] navigation fixes


## v0.02
- deck creation
- v0.02 api to CR decks

## v0.01
- materialze css frontend
- v0.01 api to retrieve cards
- hardcoded deck