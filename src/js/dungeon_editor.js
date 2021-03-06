$(function () {
    Game.dungeonEditorMode = true;
    $('.character_editor, .dungeon_generator, .team').hide();
    $('.dungeon').show();
    Game.ready(function () {
        ViewModel.create({
            el: 'body',
            shortcuts: {
                $mainForm: '.dungeon_editor',
                $map: '.map',
                $cellClass: '#cell_class',
                $brushMode: '#brush_mode',
                $cellData: '#cell_data',
                $cellEditor: '.cell_editor',
                $width: '#dungeon_width',
                $height: '#dungeon_height',
                $level: '#dungeon_level',
                $cellPosition: '.cell_position',
                $json: '#map_json'
            },
            cellSize: 21,
            events: {
                'click #new_dungeon': 'newDungeon',
                'click .map_passage': 'edit',
                'click #to_json': 'toJSONClick',
                'click #from_json': 'fromJSONClick',
                'click #save_cell': 'saveCell',
                'click #generate_dungeon': 'generate'
            },
            toJSONClick: function () {
                this.$json.val(JSON.stringify(this.map.toJSON()));
            },
            saveCell: function (e) {
                var cell = this.selectedCell;
                if (!cell) {
                    return;
                }
                var data = this.$cellData.val();
                if (data) {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        alert('data must be valid json!');
                        return;
                    }
                }
                //console.log(data);
                //console.log();

                this.$cellEditor.find('input[type=text]').each(function () {
                    cell[this.name] = this.value;
                });
                var newClassName = this.$cellClass.val();

                cell.data = data;
                if (newClassName != cell.getClass()) {
                    var newClass = MapCellClasses[newClassName] || MapCell;
                    cell = this.map.matrix[cell.y][cell.x] = new newClass(cell);
                }


                var $cell = this.$map.children().eq(cell.index).attr('class', 'map_passage ' + cell.className);
                if (e) {
                    $cell.click();
                }
                this.selectedCell = undefined;
            },
            edit: function (e) {


                var $cell = $(e.currentTarget);
                var index = $cell.index();
                var w = this.map.width;
                //var h = this.$height.val() | 0;
                var y = index / w | 0;
                var x = index % w;
                var cell = this.selectedCell = this.map.matrix[y][x];

                this.$cellPosition.html('x: ' + x + ' y:' + y);
                if (this.$brushMode[0].checked) {
                    this.saveCell();
                    return;
                }


                this.$cellData.val(JSON.stringify(cell.data));
                this.$cellEditor.find('input[type=text]').each(function () {
                    this.value = cell[this.name];
                });

                this.$cellClass.val(cell.getClass());
            },
            render: function () {
                var $map = this.$map;
                $map.empty();


                var self = this;
                this.map.eachCell(function (element, x, y) {

                    $map.append('<div class="map_passage ' + element.className + '" style="left: ' + x * self.cellSize + 'px; top:' + y * self.cellSize + 'px;"></div>');
                });
            },

            createMap: function (matrix) {
                this.map = new Map({
                    matrix: matrix,
                    entryX: 0,
                    entryY: 0,
                    dungeonLevel: this.$level
                });

                this.render();
            },
            fromJSONClick: function () {
                this.map = Map.fromJSON(JSON.parse(this.$json.val()));
                this.render();
            },
            generate: function () {
                var matrix = InitalMazeGenerator.generate(this.$width.val() * 1, this.$height.val() * 1)
                this.map = DungeonGenerator.generateFromMatrix(matrix, 'default', 1);
                this.render();
            },
            newDungeon: function () {
                this.createMap(Map.createMatrix(this.$width.val() * 1, this.$height.val() * 1));
            },
            initialize: function () {
                var $select = this.$cellClass;
                $select.append('<option value="MapCell">MapCell</option>');
                _.each(MapCellClasses, function (Class, name) {
                    $select.append('<option value="' + name + '">' + name + '</option>');
                });

            }
        });
    });
});

