// Значения элементов массива карты
// 0 - пол
// 1 - стена
// 2 - меч
// 3 - зелье
// 4 - противник
// 5 - герой

function Game() {
  this.map = [];        // Информация о карте
  this.enemies = [];    // Информация о противниках
  this.deadEnemies = 0;
  this.heroRow = 0;     // Координата X героя
  this.heroCol = 0;     // Координата Y героя
  this.power = 1;       // Сила героя
  this.hp = 5;          // Здоровье героя
  this.initialHP = this.hp;
  this.bindEventListeners();
  setInterval(() => {
    this.moveEnemies();
    this.renderMap();
    if(this.hp <= 0) {
      location.reload(true); //Перезагрузка уровня после поражения
    }
  }, 1000);
}

Game.prototype.init = function() {
  this.generateMap(40, 24);
  this.renderMap();
};

// Функция генерации карты
Game.prototype.generateMap = function(width, height) {
  // Заполняем карту стенами
  for (var i = 0; i < height; i++) {
    var row = [];
    for (var j = 0; j < width; j++) {
      row.push(1);
    }
    this.map.push(row);
  }

  // Размещаем случайное число прямоугольных комнат
  var numRooms = Math.floor(Math.random() * 6) + 5; // случайное число от 5 до 10
  var maxAttempts = 10; // максимальное число попыток размещения комнаты

  for (var k = 0; k < numRooms; k++) {
    var roomWidth = Math.floor(Math.random() * 6) + 3; // случайное число от 3 до 8
    var roomHeight = Math.floor(Math.random() * 6) + 3; // случайное число от 3 до 8

    var roomX, roomY, attempts = 0;

    // Повторяем генерацию координат до тех пор, пока не найдем подходящее место
    do {
      roomX = Math.floor(Math.random() * (width - roomWidth));
      roomY = Math.floor(Math.random() * (height - roomHeight));
      attempts++;
    } while (this.roomIntersects(roomX, roomY, roomWidth, roomHeight) && attempts < maxAttempts);

    // Если не удалось найти подходящее место, пропускаем текущую комнату
    if (attempts < maxAttempts) {
      for (var m = roomY; m < roomY + roomHeight; m++) {
        for (var n = roomX; n < roomX + roomWidth; n++) {
          this.map[m][n] = 0;
        }
      }
    }
  }
  this.addPassages(width, height);
  this.addSwords();
  this.addHeal();
  this.addEnemy();
  this.addHero();
};

// Функция добавления проходов
Game.prototype.addPassages = function(width, height) {
  // Добавляем горизонтальные проходы
  for (var i = 0; i < 4; i++) {
      var passageY = Math.floor(Math.random() * ( height / 4)) + i * (height / 4); // Необходимо, чтобы проходы не были рядом
      for (var j = 0; j < width; j++) {
          this.map[passageY][j] = 0;
      }
  }

  // Добавляем вертикальные проходы
  for (var i = 0; i < 4; i++) {
      var passageX = Math.floor(Math.random() * ( width / 4)) + i * (width / 4); // Необходимо, чтобы проходы не были рядом
      for (var j = 0; j < height; j++) {
          this.map[j][passageX] = 0;
      }
  }
};

// Функция пресечения пересечейний комнат
Game.prototype.roomIntersects = function(x, y, width, height) {
  // Проверяем, пересекается ли комната с уже существующими комнатами
  for (var i = y - 1; i < y + height + 1; i++) {
    for (var j = x - 1; j < x + width + 1; j++) {
      if (this.map[i] && this.map[i][j] === 0) {
        return true; // комната пересекается
      }
    }
  }
  return false; // комната не пересекается
};

// Функция добавления мечей
Game.prototype.addSwords = function() {
  const rows = this.map.length;
  const cols = this.map[0].length;

  for (let i = 0; i < 2; i++) {
    let randomRow, randomCol;

    // Генерация случайных координат
    do {
      randomRow = Math.floor(Math.random() * rows);
      randomCol = Math.floor(Math.random() * cols);
    } while (this.map[randomRow][randomCol] !== 0); // Повторяем, пока не найдем 0

    // Замена 0 на 2
    this.map[randomRow][randomCol] = 2;
  }
}

// Функция добавления зелей
Game.prototype.addHeal = function() {
  const rows = this.map.length;
  const cols = this.map[0].length;

  for (let i = 0; i < 10; i++) {
    let randomRow, randomCol;

    // Генерация случайных координат
    do {
      randomRow = Math.floor(Math.random() * rows);
      randomCol = Math.floor(Math.random() * cols);
    } while (this.map[randomRow][randomCol] !== 0); // Повторяем, пока не найдем 0

    this.map[randomRow][randomCol] = 3;
  }
}

// Функция добавления противников
Game.prototype.addEnemy = function() {
  const rows = this.map.length;
  const cols = this.map[0].length;

  for (let i = 0; i < 10; i++) {
    let randomRow, randomCol;

    // Генерация случайных координат
    do {
      randomRow = Math.floor(Math.random() * rows);
      randomCol = Math.floor(Math.random() * cols);
    } while (this.map[randomRow][randomCol] !== 0); // Повторяем, пока не найдем 0

    this.enemies.push({ row: randomRow, col: randomCol, hp: 3 });

    this.map[randomRow][randomCol] = 4;
  }
}

// Функция добавления героя
Game.prototype.addHero = function(xPosition = -1, yPosition = -1) {
  const rows = this.map.length;
  const cols = this.map[0].length;

  let randomRow, randomCol;

  // Генерация случайных координат
  if(xPosition == -1) {
    do {
      randomRow = Math.floor(Math.random() * rows);
      randomCol = Math.floor(Math.random() * cols);
    } while (this.map[randomRow][randomCol] !== 0); // Повторяем, пока не найдем 0
  } else {
    randomRow = xPosition;
    randomCol = yPosition;
  }
  this.heroRow = randomRow;
  this.heroCol = randomCol;
  this.map[randomRow][randomCol] = 5;
}

// Функция бинда клавиш
Game.prototype.bindEventListeners = function() {
  // Сохраняем ссылку на текущий контекст
  var self = this;

  // Добавляем обработчик событий для нажатия клавиш
  window.addEventListener('keydown', function(event) {
    // Вызываем метод moveHero при нажатии клавиш WASD
    switch(event.key.toLowerCase()) {
      case 'w':
        self.moveHero(-1, 0);
        break;
      case 'ц':
        self.moveHero(-1, 0);
        break;
      case 'a':
        self.moveHero(0, -1);
        break;
      case 'ф':
        self.moveHero(0, -1);
        break;
      case 's':
        self.moveHero(1, 0);
        break;
      case 'ы':
        self.moveHero(1, 0);
        break;
      case 'd':
        self.moveHero(0, 1);
        break;
      case 'в':
        self.moveHero(0, 1);
        break;
      case ' ':
        self.heroAttack();
        break;
    }

    // Перерисовываем карту после перемещения героя
    self.renderMap();
  });
};

// Функция передвижения героя
Game.prototype.moveHero = function(rowDelta, colDelta) {
  // Проверяем, можно ли переместить героя в новую позицию
  var newRow = this.heroRow + rowDelta;
  var newCol = this.heroCol + colDelta;

  if (this.map[newRow] && newCol >= 0 && newCol < this.map[0].length && this.map[newRow][newCol] !== 1 && this.map[newRow][newCol] !== 4) {
    // Если на поле меч, герой подбирает его
    if(this.map[newRow][newCol] === 2) {
      this.power++;
    }
    // Если на поле зелье, герой подбирает лечится
    if(this.map[newRow][newCol] === 3) {
      this.hp += 1;
      console.log(this.hp);
    }
    // Если новая позиция свободна, перемещаем героя
    this.map[this.heroRow][this.heroCol] = 0;
    this.heroRow = newRow;
    this.heroCol = newCol;
    this.map[this.heroRow][this.heroCol] = 5;
  }
};

// Функция атаки героя по области
Game.prototype.heroAttack = function() {
  const heroRow = this.heroRow;
  const heroCol = this.heroCol;

  // Проверяем соседние клетки и атакуем противников
  this.attackEnemy(heroRow - 1, heroCol); // Верх
  this.attackEnemy(heroRow + 1, heroCol); // Низ
  this.attackEnemy(heroRow, heroCol - 1); // Влево
  this.attackEnemy(heroRow, heroCol + 1); // Вправо
};

// Функция атаки по направлению
Game.prototype.attackEnemy = function(row, col) {
  if (row >= 0 && row < this.map.length && col >= 0 && col < this.map[0].length) {
    const enemy = this.findEnemy(row, col);
    if (enemy) {
      // Уменьшаем здоровье противника
      enemy.hp -= this.power;

      // Если здоровье стало меньше или равно 0, удаляем противника из массива и с карты
      if (enemy.hp <= 0) {
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.map[row][col] = 0;
        this.deadEnemies++;
        console.log(this.deadEnemies);
        if(this.deadEnemies == 10) {
          location.reload(true); //Перезагрузка уровня после победы
        }
      }
    }
  }
};

// Функция поиска противника
Game.prototype.findEnemy = function(row, col) {
  return this.enemies.find(enemy => enemy.row === row && enemy.col === col);
};

// Функция перемещения противника
Game.prototype.moveEnemies = function() {
  for (let enemy of this.enemies) {
    // Противник атакует, если герой на соседнем поле
    if(enemy.row + 1 == this.heroRow && enemy.col == this.heroCol) {
      this.hp--;
    } else if (enemy.row == this.heroRow && enemy.col + 1 == this.heroCol) {
      this.hp--;
    } else if (enemy.row - 1 == this.heroRow && enemy.col == this.heroCol) {
      this.hp--;
    } else if (enemy.row == this.heroRow && enemy.col - 1 == this.heroCol) {
      this.hp--;
    }
    

    // Генерируем случайное направление движения (0 - вверх, 1 - вправо, 2 - вниз, 3 - влево)
    const direction = Math.floor(Math.random() * 4);

    // Вычисляем новые координаты в зависимости от направления
    let newRow = enemy.row;
    let newCol = enemy.col;

    switch (direction) {
      case 0: // Вверх
        newRow--;
        break;
      case 1: // Вправо
        newCol++;
        break;
      case 2: // Вниз
        newRow++;
        break;
      case 3: // Влево
        newCol--;
        break;
    }

    // Проверяем, можно ли переместить противника в новую позицию
    if (this.map[newRow] && newCol >= 0 && newCol < this.map[0].length && this.map[newRow][newCol] !== 1 && this.map[newRow][newCol] !== 4 && this.map[newRow][newCol] !== 5) {
      // Обновляем координаты противника
      this.map[enemy.row][enemy.col] = 0;
      enemy.row = newRow;
      enemy.col = newCol;
      this.map[newRow][newCol] = 4;

    }
  }
};


// Функция рендера карты
Game.prototype.renderMap = function() {
  var field = document.querySelector('.field');

  // Очищаем поле
  field.innerHTML = '';

  // Отрисовываем карту
  for (var i = 0; i < this.map.length; i++) {
    for (var j = 0; j < this.map[i].length; j++) {
      var tile = document.createElement('div');
      tile.className = 'tile';

      // Если это стена, добавляем класс tileW
      if (this.map[i][j] === 1) {
        tile.classList.add('tileW');    //Добавление стены
      } else if(this.map[i][j] === 2) {
        tile.classList.add('tileSW');   //Добавление мечей
      } else if(this.map[i][j] == 3) {
        tile.classList.add('tileHP')    //Добавление зелей
      } else if(this.map[i][j] == 4) {
        tile.classList.add('tileE')     //Добавление противников
        let health = document.createElement('div');
        health.className = 'health';
        let enemyHP = this.findEnemy(i, j).hp * 100 / 3;
        health.style.width = enemyHP + '%';
        tile.appendChild(health);
      } else if(this.map[i][j] == 5) {
        tile.classList.add('tileP')     //Добавление героя
        let health = document.createElement('div');
        health.className = 'health';
        let heroHP = this.hp * 100 / this.initialHP;
        health.style.width = heroHP + '%';
        tile.appendChild(health);
      }

      // Рассчитываем координаты тайла
      var topPosition = i * 50; // высота тайла 50px
      var leftPosition = j * 50; // ширина тайла 50px

      // Устанавливаем координаты тайла
      tile.style.top = topPosition + 'px';
      tile.style.left = leftPosition + 'px';

      // Добавляем тайл на поле
      field.appendChild(tile);
    }
  }
};
