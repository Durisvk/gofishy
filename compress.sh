cd public/js
uglifyjs --no-mangle-functions ads.js footer_strings.js grid.js logo.js sprite.js camera.js game.js > js.min.js
cd ../common
uglifyjs --no-mangle-functions player.js world.js bot.js coral.js food.js runes.js spiky.js fish.js shark.js > common.min.js
cd ../../..
zip server.zip ./server
