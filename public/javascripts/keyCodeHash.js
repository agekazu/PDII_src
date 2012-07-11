function keyCodeHash(keyBordType){
  var smallHash;  
  var capitalHash; 
  //JIS配列の時
  if(keyBordType == "JIS"){
    smallHash = {
      188:",",
      190:"."};  

    capitalHash = {
      188:"<",
      190:">"};  
    //US配列の時
  }else{
    smallHash = {
      188:",",
      190:"."};  

    capitalHash = {
      188:"<",
      190:">"};  
  }
  return new Array(smallHash, capitalHash);
}
