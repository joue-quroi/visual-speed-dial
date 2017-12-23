'use strict';
var RandomColor = {
  nextColor: 9,
  colors: ['fff', '1d447d', '3ab487', '205396', 'f0c92c',
    '189196', '2b6c90', '3ab0b4', '189365', 'c83d1d', '47a6c7', '55931f',
    '683089', '3ab487', '39448f', '3a88b4', 'a43343', 'b42424', '55338e',
    '47a6c7', 'bb7231', '2d85a4', 'e54c29', 'e06b00', '863ab4', '982f2f',
    '963a97', '189196', '3ab487'],
  get Get() {
    this.nextColor = (this.nextColor === this.colors.length - 1) ? 0 : ++this.nextColor;
    return this.colors[this.nextColor];
  }
};
