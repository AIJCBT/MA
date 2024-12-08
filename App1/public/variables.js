
//variables from https://github.com/FVANCOP/ChartNew.js/blob/a968f641fe72f879717134203c6e92ef8cac0975/Samples/function_gauss.html
const bmichart = function(docsst18, docs18to25, docs25to30, docs30to35, docs35to40, docsgt40){
    defCanvasWidth=1200;
    defCanvasHeight=600;

    var normalbmis = {
        labels : ["<18.5", "18.5-24.9", "25-29.9", "30-34.9", "35-39.9", ">40"],   
        datasets : [
            {
                fillColor : "rgba(220,220,220,0.5)",
                strokeColor : "rgba(220,220,220,1)",
                pointColor : "rgba(220,220,220,1)",
                pointStrokeColor : "#fff",
                data : [docsst18, docs18to25, docs25to30, docs30to35, docs35to40, docsgt40],
                title : "Anzahl Dokumente pro BMI Klasse"
            }
        ]
    }
}
