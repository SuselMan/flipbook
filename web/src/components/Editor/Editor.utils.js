import * as uuid from 'uuid';

export const getEmptyFrame = (index) => {
    return {
        dataUrl: '',
        id: btoa(uuid.v4()),
        index,
    }
}

//const undo = (evt) => {
//       if (evt.ctrlKey) {
//         if(evt.key === 'z') {
//           if(steps.length <= 1) {
//             alert('Nothing to undo');
//             return;
//           }
//           steps.pop();
//           console.log('undo', steps[steps.length - 1]);
//           const img = new Image();
//           img.onload = () => {
//             context.fillStyle = "#FFF";
//             context.fillRect(0, 0, 1024, 600);
//             context.drawImage(img,0,0); // Or at whatever offset you like
//             layer.batchDraw();
//           };
//           img.src = steps[steps.length - 1];
//         }
//       }
//     }
//
//     document.addEventListener('keyup', undo);