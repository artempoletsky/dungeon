var Player = Events.create({
    mainCharacter: undefined,
    party: [],
    newGame: function(){
        this.mainCharacter=new Human('Anonymous', {
            strength: 5,
            agility: 5,
            magic: 0,
            speed: 5,
            perception: 5
        });
        this.mainCharacter.prop('attributesPoints', 30);
        this.mainCharacter.prop('skillPoints', 5);
        this.party.push(this.mainCharacter);
    }
});
