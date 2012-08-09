1	680x0MPU,Human68k,HAS.x_HelloWorld
 pea.l (mes,pc)
 dc.w $ff09        ; DOS _PRINT
 addq.l #4,sp
 dc.w $ff00        ; DOS _EXIT

mes: dc.b 'Hello, world!',0
