@ECHO OFF
cls
git pull origin master
cd Both
dir
# pause
node Bookmarks.js
cd ..
