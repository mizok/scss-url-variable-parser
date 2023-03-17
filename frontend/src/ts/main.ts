function main(){
    const btn = document.querySelector('button')
    const textarea1 = document.querySelector('#textarea-1') as HTMLTextAreaElement;
    const textarea2 = document.querySelector('#textarea-2') as HTMLTextAreaElement;
    btn.addEventListener('click',async()=>{
        let output;
        const t1Val = textarea1.value;
        
        await fetch('http://localhost:3000/convert', {
            method: 'POST',
            body: t1Val,
            headers: {
                'Content-Type': 'text/plain'
            }
        })
        .then(response => response.text())
        .then(data => {
            textarea2.value = data 
        })
        .catch(error => output = error);
        
    })
}

main(

)