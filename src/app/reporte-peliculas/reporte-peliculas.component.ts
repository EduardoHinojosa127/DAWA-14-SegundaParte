import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];
  selectedFiltroGenero: string = 'todos';
selectedFiltroAnio: string = 'todos';
  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
      this.peliculasFiltradas = data; // Inicialmente, las películas filtradas serán todas las películas
    });
  }

  generarPDF() {
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Título', style: 'tableHeader' },
              { text: 'Género', style: 'tableHeader' },
              { text: 'Año de lanzamiento', style: 'tableHeader' }
            ],
            ...this.peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
          ]
        }
      }
    ];
  
    const estilos = {
      header: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 10] // Margen inferior de 10 unidades
      },
      tableHeader: {
        fontSize: 12,
        bold: true,
        fillColor: '#CCCCCC',
        alignment: 'center'
      },
      tableCell: {
        margin: [0, 5, 0, 5] // Margen superior e inferior de las celdas de la tabla
      }
    };
  
    const docDefinition: any = {
      content: contenido,
      styles: estilos
    };
  
    pdfMake.createPdf(docDefinition).open();
  }
  

  filtrarPorOpcion(event: any) {
    this.selectedFiltroGenero = event.target.value;
    this.aplicarFiltro();
  }
  
  filtrarPorAnio(event: any) {
    this.selectedFiltroAnio = event.target.value;
    this.aplicarFiltro();
  }
  
  aplicarFiltro() {
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      const cumpleFiltroGenero = this.selectedFiltroGenero === 'todos' || pelicula.genero === this.selectedFiltroGenero;
      const cumpleFiltroAnio = this.selectedFiltroAnio === 'todos' || pelicula.lanzamiento.toString() === this.selectedFiltroAnio;
      return cumpleFiltroGenero && cumpleFiltroAnio;
    });
  }
  
  exportarExcel() {
    const datos = this.peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()]);
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Peliculas');
    const libroExcel = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    this.descargarArchivo(libroExcel, 'peliculas.xlsx');
  }

  
  exportarCSV() {
    const datosCSV = this.peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()]);
    const contenidoCSV = datosCSV.map(fila => fila.join(',')).join('\n');
    const archivoCSV = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    saveAs(archivoCSV, 'peliculas.csv');
  }

  descargarArchivo(data: any, nombreArchivo: string) {
    const archivo = new Blob([data], { type: 'application/octet-stream' });
    saveAs(archivo, nombreArchivo);
  }
  

  
}
