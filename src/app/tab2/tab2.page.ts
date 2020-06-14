import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Papa} from 'ngx-papaparse';
import {Platform} from '@ionic/angular';
import {File} from '@ionic-native/file/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  private columns = [];
  private tableStyle = 'bootstrap';
  private csvData: any[] = [];
  private headerRow: any[] = [];
  private rows = [];
  private fileName = '';

  constructor(private http: HttpClient, private papa: Papa, private plt: Platform,
              private file: File, private socialSharing: SocialSharing) {

    this.loadCSV().then();
  }

  private async loadCSV() {
    await this.http.get('./assets/mois1.csv', {
      responseType: 'text'
    }).subscribe(
        data => this.extractData(data),
        err => this.handleError(err)
    );
  }

  async open(row) {
    // console.log(row);
  }

  private async extractData(res) {
    const csvData = res || '';
    let tableBoutiques;
    let boutique;
    let tableColumns;
    let column;

    tableColumns = [];
    tableBoutiques = [];
    await this.papa.parse(csvData, {
      complete: parsedData => {
        this.headerRow = parsedData.data.splice(0, 1)[0];
        console.log(this.headerRow);
        for (column of this.headerRow) {
          tableColumns.push({
            name: column,
          });
        }
        this.columns = tableColumns;
        console.log(this.columns);
        this.csvData = parsedData.data;
        for (boutique of this.csvData) {
          tableBoutiques.push({
            name: boutique[0],
            gender: boutique[1],
            company: boutique[2],
          });
        }
        this.rows = tableBoutiques;
      }
    });
  }

  exportCSV() {
    const csvData = this.getValues();
    const headerRow = this.getKeys();
    const csv = this.papa.unparse({
      fields: headerRow,
      data: csvData
    });

    // cordova means mobile app
    if (this.plt.is('cordova')) {
      this.file.writeFile(this.file.dataDirectory, 'mois1.csv', csv, { replace: true }).then( res =>  {
         this.socialSharing.share(null, null, res.nativeURL, null);
        });
    } else {
      // Dummy implementation for Desktop download purpose
      const blob = new Blob([csv]);
      const a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = 'mois1.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  private getKeys() {
    const keys = [];

    for ( let i = 0; i < this.columns.length; i++) {
      keys[i] = this.columns[i].name;
    }
    return keys;
  }

  private getValues() {
    let values;
    let dataValue;

    values = [];
    let value;
    for (value of this.rows) {
      dataValue = [];
      let column;
      let j = 0;
      for (column of this.columns) {
        column.name = column.name.replace(column.name.charAt(0), column.name.charAt(0).toLowerCase());
        dataValue[j] = value[column.name];
        j++;
      }
      values.push(dataValue);
    }
    return values;
  }

  private handleError(err) {
    console.log('something went wrong: ', err);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

}
