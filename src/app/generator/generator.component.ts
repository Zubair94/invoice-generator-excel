import { Component, OnInit } from '@angular/core';
import { AlertService } from '../core/services/alert.service';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs
pdfMake.fonts = {
  NotoSansBengali: {
    normal: 'NotoSansBengaliRegular.ttf',
    bold: 'NotoSansBengaliBold.ttf',
    italics: 'NotoSansBengaliRegular.ttf',
    bolditalics: 'NotoSansBengaliBold.ttf'
  },
  Montserrat:{
    normal: 'MontserratRegular.ttf',
    bold: 'MontserratBold.ttf',
    italics: 'MontserratItalic.ttf',
    bolditalics: 'MontserratBoldItalic.ttf'
  }
}
@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent implements OnInit {

  fileSelected: File;
  fileBuffer:any;
  isError: boolean = false;
  isHovering: boolean = false;
  errorMessage: string = "";
  fileSelectedImage: File;
  fileBufferImage:any;
  isErrorImage: boolean = false;
  isHoveringImage: boolean = false;
  errorMessageImage: string = "";
  excelObj: any;
  pdffile: JSZip;
  pdffolder: JSZip;
  generated: boolean = false;
  showProgress: boolean = false;
  constructor(private alertService: AlertService) { 
    
  }

  ngOnInit() {
  }

  startUpload(fileList: FileList){
    this.isError = false;
    if(fileList.length !== 1){
      this.errorMessage = "Please add only 1 excel file";
      this.alertService.warning("Please add only 1 excel file", "Error");
      this.isError = true;
      return;
    }
    this.fileSelected = fileList.item(0);
    if(this.fileSelected.name.split('.')[1] !== "xlsx"){
      this.errorMessage = "Added file is not of .xlsx format";
      this.alertService.warning("Added file is not of .xlsx format", "Error");
      this.isError = true;
      this.fileSelected = null;
      return;
    }
    this.loadExcel().then(obj => {
      this.excelObj = obj;
      this.alertService.success("Loaded excel file to pdf", "Success");
    });
  }

  startUploadImage(fileList: FileList){
    this.isError = false;
    if(fileList.length !== 1){
      this.errorMessage = "Please add only 1 image";
      this.alertService.warning("Please add only 1 image", "Error");
      this.isError = true;
      return;
    }
    this.fileSelectedImage = fileList.item(0);
    if(this.fileSelectedImage.type.split('/')[0] !== "image"){
      this.errorMessage = "Added file is not an image";
      this.alertService.warning("Added file is not an image", "Error");
      this.isError = true;
      this.fileSelectedImage = null;
      return;
    }
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      this.fileBufferImage = fileReader.result;
      this.alertService.success("Loaded image file to pdf", "Success");
    }
    fileReader.readAsDataURL(this.fileSelectedImage);
  }

  private resolveFont(text: string){
    const regex = /[^\u0000-\u00ff]/; // Small performance gain from pre-compiling the regex
    return regex.test(text);
  }

  private loadExcel(){
    return new Promise((resolve: any, reject: any) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.fileBuffer = fileReader.result;
        var data = new Uint8Array(this.fileBuffer);
        var arr = new Array();
        for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, {type:"binary"});
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        let obj:any = (XLSX.utils.sheet_to_json(worksheet,{raw:true}));
        for(var i=0; i<obj.length; i++){
          let index = 0;
          let products = [
            [{text: '#', sytle: 'tableHeader'}, {text: 'Product', sytle: 'tableHeader'}, {text: 'Quantity', sytle: 'tableHeader'}, {text: 'Unit Price', sytle: 'tableHeader'}, {text: 'Amount', sytle: 'tableHeader'}]
          ];
          Object.keys(obj[i]).forEach(key => {
            if(key.includes('Product')){
              index=index+1;
            }
          });
          obj[i].productLength = index;
          for(var j = 0; j < index; j++){
            let product = [];
            let x = (j+1).toString();
            product.push(x);
            Object.keys(obj[i]).forEach(key => {
              if(key === `${"Product"}${j}`){
                product.push({text: obj[i][key], font: this.resolveFont(obj[i][key]) ? 'NotoSansBengali': 'Montserrat'});
                delete obj[i][key];
              }
              if(key === `${"Quantity"}${j}`){
                product.push(obj[i][key]);
                delete obj[i][key];
              }
              if(key === `${"Unit price"}${j}`){
                product.push({text: 'Tk.' + obj[i][key].toString(), alignment: 'right'});
                delete obj[i][key];
              }
              if(key === `${"Total"}${j}`){
                product.push({text: 'Tk.' + obj[i][key].toString(), alignment: 'right'});
                delete obj[i][key];
              }
            });
            products.push(product);
          }
          obj[i].products = products;
        }
        resolve(obj);
      }
      fileReader.onerror = () => {
        reject("Error Occured");
      }
      fileReader.readAsArrayBuffer(this.fileSelected);
    });
  }

  private generateRandom(){
    let length = 7;
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++){
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  private generatePDF(documentObj: any): Promise<boolean>{
    let date = new Date(Date.now()).toLocaleDateString();
    let splitdate = date.split('/');
    if(!documentObj['Order Date'] || documentObj['Order Date'] === ''){
      documentObj['Order Date'] = date;
    }
    documentObj['Order No'] = `${"GF-"}${splitdate[1]}${splitdate[0]}${splitdate[2]}${"-"}${this.generateRandom()}`;
    documentObj['Invoice No'] = `${this.generateRandom()}`;
    const documentDefinition = this.documentDefinition(documentObj); 
    let pdfDocGenerator = pdfMake.createPdf(documentDefinition);
    return new Promise(resolve => {
      pdfDocGenerator.getBase64((base64String:string) => {
        this.pdffolder.file(documentObj['Invoice No']+'.pdf', base64String, {base64: true});
        resolve(true);
      });
    });
  }

  onGeneratePDF(){
    if(!this.fileSelected || !this.fileSelectedImage || this.fileSelected === null || this.fileSelectedImage === null){
      this.alertService.warning("Please select an excel file and image first.", "Error");
    } else{
      this.showProgress = true;
      this.pdffile = new JSZip();
      this.pdffolder = this.pdffile.folder('invoices');
      let promises = [];
      for(var i =0; i<this.excelObj.length; i++){
        if(this.excelObj[i]['Customer Name']){
          promises.push(this.generatePDF(this.excelObj[i]));
        }
      }
      Promise.all(promises).then(result => {
        if(result.length > 0){
          this.generated = true;
          this.showProgress = false;
          this.alertService.success("Invoice generation complete.", "Success");
        }
      });
    }
  }

  async onDownload(){
    let content = await this.pdffile.generateAsync({type:"blob"});
    saveAs(content, "invoices.zip");
    if(content){
      this.generated = false;
      this.showProgress = false;
    }
  }

  private documentDefinition(documentObj: any){
    return {
      info:{
        title: documentObj['Invoice No'],
        author: 'togumogu.com',
        subject: 'invoice'
      },
      pageSize: 'A4',
      // by default we use portrait, you can change it to landscape if you wish
      pageOrientation: 'portrait',
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      content: [
        {
          columns:[
            {
              width: 'auto',
              margin: [0, 0, 0, 0],
              stack:[
                {
                  image: this.fileBufferImage,
                  width: 200,
                  height: 75
                }
              ]
            },
            {
              width: '*',
              alignment: 'right',
              stack: [
                {
                  style: 'h6',
                  text: 'Rezina Garden, House 67/A,'
                },
                {
                  style: 'h6',
                  text: 'Road 9/A, Dhanmondi'
                },
                {
                  style: 'h6',
                  text: 'Dhaka, Bangladesh'
                },
                {
                  style: 'h6',
                  text: 'Mobile: +880194-4665577'
                }
              ]
            }
          ]
        },
        {
          margin: [0, 30, 0, 20],
          columns:[
            {
              width: '*',
              alignment: 'left',
              stack: [
                {
                  style: 'h6',
                  text: 'Customer Name: '+documentObj['Customer Name']
                },
                {
                  style: 'h6',
                  text: documentObj['Customer Address']
                },
                {
                  style: 'h6',
                  text: 'Mobile: '+documentObj['Customer Mobile']
                },
              ] 
            },
            {
              width: '*',
              alignment: 'right',
              stack: [
                {
                  style: 'h6',
                  text: 'Invoice No: '+documentObj['Invoice No']
                },
                {
                  style: 'h6',
                  text: 'Invoice Date: '+new Date(Date.now()).toLocaleDateString()
                },
                {
                  style: 'h6',
                  text: 'Order No: '+documentObj['Order No']
                },
                {
                  style: 'h6',
                  text: 'Order Date: '+documentObj['Order Date']
                },
                {
                  style: 'h6',
                  text: 'Payment Method: '+documentObj['Payment Method']
                }
              ] 
            }
          ]
        },
        {
          style: 'tableExample',
          table: {
            widths: [25, 275, 60, 60, 50],
            body: documentObj.products
          }
        },
        {
          margin: [350, 20, 0, 0],
          width: '*',
          alignment: 'right',
          stack:[
            {
              columns:[
                {
                  width: 'auto',
                  alignment: 'left',
                  style: 'h6',
                  text: 'Subtotal:'
                },
                {
                  width: '*',
                  alignment: 'right',
                  style: 'h6',
                  text: 'Tk.'+documentObj['Subtotal']
                }
              ]
            },
            {
              columns:[
                {
                  width: 'auto',
                  alignment: 'left',
                  style: 'h6',
                  text: 'Flat Shipping Rate:'
                },
                {
                  width: '*',
                  alignment: 'right',
                  style: 'h6',
                  text: 'Tk.'+documentObj['Flat Shipping Rate']
                }
              ]
            },
            {
              columns:[
                {
                  width: 'auto',
                  alignment: 'left',
                  style: 'h6',
                  text: 'Discount:'
                },
                {
                  width: '*',
                  alignment: 'right',
                  style: 'h6',
                  text: '-Tk.'+ documentObj['Discount'] || '0'
                }
              ]
            },
            {
              columns:[
                {
                  width: 'auto',
                  alignment: 'left',
                  style: 'h6',
                  text: 'Total:'
                },
                {
                  width: '*',
                  alignment: 'right',
                  style: 'h6',
                  text: 'Tk.'+documentObj['GrandTotal']
                }
              ]
            }
          ]
        }
      ],
      defaultStyle: {
        font: 'Montserrat'
      }
    }
  }

  toggleHover(event){
    this.isHovering = event;
  }

  toggleHoverImage(event){
    this.isHovering = event;
  }
}
