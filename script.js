console.log(`PROGRAM BOOT`);








for(let i= 0; i< 100; i++){

   setTimeout(() => {
        console.log(`...`);
   }, i* 200);
}

 setTimeout(() => {
        console.log(`RUNNING`);
   }, 1000);