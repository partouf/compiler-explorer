
C:\Users\admin\AppData\Local\Temp\compiler-explorer-compiler118326-9900-1lff2g1.vira\prog.exe:     file format pei-i386


Disassembly of section .text:

00401530 <PASCALMAIN>:
main():
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/prog.dpr:1
  401530:	55                                              	push   ebp
  401531:	89 e5                                           	mov    ebp,esp
  401533:	e8 c8 69 00 00                                  	call   407f00 <FPC_INITIALIZEUNITS>
  401538:	e8 e3 6c 00 00                                  	call   408220 <FPC_DO_EXIT>
  40153d:	c9                                              	leave  
  40153e:	c3                                              	ret    
  40153f:	90                                              	nop

00401540 <DEBUGEND_$P$PROG>:
  401540:	64 a1 04 00 00 00                               	mov    eax,fs:0x4
  401546:	c3                                              	ret    
	...

0040c240 <DEBUGSTART_$OUTPUT>:
SQUARE():
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:17
  40c240:	55                                              	push   ebp
  40c241:	89 e5                                           	mov    ebp,esp
  40c243:	8d 64 24 fc                                     	lea    esp,[esp-0x4]
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:18
  40c247:	8b 55 08                                        	mov    edx,DWORD PTR [ebp+0x8]
  40c24a:	8b 45 08                                        	mov    eax,DWORD PTR [ebp+0x8]
  40c24d:	0f af c2                                        	imul   eax,edx
  40c250:	8d 40 10                                        	lea    eax,[eax+0x10]
  40c253:	89 45 fc                                        	mov    DWORD PTR [ebp-0x4],eax
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:20
  40c256:	8b 45 fc                                        	mov    eax,DWORD PTR [ebp-0x4]
  40c259:	c9                                              	leave  
  40c25a:	c2 04 00                                        	ret    0x4
  40c25d:	90                                              	nop
  40c25e:	90                                              	nop
  40c25f:	90                                              	nop

0040c260 <INIT$_$OUTPUT>:
OUTPUT_$$_init$():
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:22
  40c260:	55                                              	push   ebp
  40c261:	89 e5                                           	mov    ebp,esp
  40c263:	8d 64 24 fc                                     	lea    esp,[esp-0x4]
  40c267:	53                                              	push   ebx
  40c268:	c7 45 fc 00 00 00 00                            	mov    DWORD PTR [ebp-0x4],0x0
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:23
  40c26f:	e8 cc e8 ff ff                                  	call   40ab40 <fpc_get_output>
  40c274:	89 c3                                           	mov    ebx,eax
  40c276:	6a 06                                           	push   0x6
  40c278:	e8 c3 ff ff ff                                  	call   40c240 <DEBUGSTART_$OUTPUT>
  40c27d:	8d 55 fc                                        	lea    edx,[ebp-0x4]
  40c280:	e8 2b 00 00 00                                  	call   40c2b0 <DEBUGEND_$OUTPUT>
  40c285:	8b 4d fc                                        	mov    ecx,DWORD PTR [ebp-0x4]
  40c288:	89 da                                           	mov    edx,ebx
  40c28a:	b8 00 00 00 00                                  	mov    eax,0x0
  40c28f:	e8 3c eb ff ff                                  	call   40add0 <FPC_WRITE_TEXT_ANSISTR>
  40c294:	e8 27 bc ff ff                                  	call   407ec0 <FPC_IOCHECK>
  40c299:	89 d8                                           	mov    eax,ebx
  40c29b:	e8 e0 e9 ff ff                                  	call   40ac80 <fpc_writeln_end>
  40c2a0:	e8 1b bc ff ff                                  	call   407ec0 <FPC_IOCHECK>
C:/Users/admin/AppData/Local/Temp/compiler-explorer-compiler118326-9900-1lff2g1.vira/output.pas:24
  40c2a5:	8d 45 fc                                        	lea    eax,[ebp-0x4]
  40c2a8:	e8 f3 5f ff ff                                  	call   4022a0 <FPC_ANSISTR_DECR_REF>
  40c2ad:	5b                                              	pop    ebx
  40c2ae:	c9                                              	leave  
  40c2af:	c3                                              	ret    

0040c2b0 <DEBUGEND_$OUTPUT>:
  40c2b0:	55                                              	push   ebp
  40c2b1:	89 e5                                           	mov    ebp,esp
  40c2b3:	8d a4 24 d4 fe ff ff                            	lea    esp,[esp-0x12c]
  40c2ba:	53                                              	push   ebx
  40c2bb:	56                                              	push   esi
  40c2bc:	89 c3                                           	mov    ebx,eax
  40c2be:	89 d6                                           	mov    esi,edx
  40c2c0:	c7 85 d4 fe ff ff 00 00 00 00                   	mov    DWORD PTR [ebp-0x12c],0x0
  40c2ca:	b8 01 00 00 00                                  	mov    eax,0x1
  40c2cf:	8d 55 dc                                        	lea    edx,[ebp-0x24]
  40c2d2:	8d 4d f4                                        	lea    ecx,[ebp-0xc]
  40c2d5:	e8 f6 b4 ff ff                                  	call   4077d0 <FPC_PUSHEXCEPTADDR>
  40c2da:	e8 e1 c3 ff ff                                  	call   4086c0 <FPC_SETJMP>
  40c2df:	50                                              	push   eax
  40c2e0:	85 c0                                           	test   eax,eax
  40c2e2:	75 46                                           	jne    40c32a <DEBUGEND_$OUTPUT+0x7a>
  40c2e4:	68 ff 00 00 00                                  	push   0xff
  40c2e9:	8d 8d d8 fe ff ff                               	lea    ecx,[ebp-0x128]
  40c2ef:	89 d8                                           	mov    eax,ebx
  40c2f1:	ba ff ff ff ff                                  	mov    edx,0xffffffff
  40c2f6:	e8 85 66 ff ff                                  	call   402980 <FPC_SHORTSTR_SINT>
  40c2fb:	8d 8d d4 fe ff ff                               	lea    ecx,[ebp-0x12c]
  40c301:	8d 85 d8 fe ff ff                               	lea    eax,[ebp-0x128]
  40c307:	66 ba 00 00                                     	mov    dx,0x0
  40c30b:	e8 60 9b ff ff                                  	call   405e70 <fpc_shortstr_to_ansistr>
  40c310:	8b 95 d4 fe ff ff                               	mov    edx,DWORD PTR [ebp-0x12c]
  40c316:	89 f0                                           	mov    eax,esi
  40c318:	e8 03 93 ff ff                                  	call   405620 <FPC_ANSISTR_ASSIGN>
  40c31d:	89 f0                                           	mov    eax,esi
  40c31f:	b1 00                                           	mov    cl,0x0
  40c321:	66 ba 00 00                                     	mov    dx,0x0
  40c325:	e8 36 a4 ff ff                                  	call   406760 <SYSTEM_$$_SETCODEPAGE$RAWBYTESTRING$WORD$BOOLEAN>
  40c32a:	e8 21 b7 ff ff                                  	call   407a50 <FPC_POPADDRSTACK>
  40c32f:	8d 85 d4 fe ff ff                               	lea    eax,[ebp-0x12c]
  40c335:	e8 66 5f ff ff                                  	call   4022a0 <FPC_ANSISTR_DECR_REF>
  40c33a:	58                                              	pop    eax
  40c33b:	85 c0                                           	test   eax,eax
  40c33d:	74 05                                           	je     40c344 <DEBUGEND_$OUTPUT+0x94>
  40c33f:	e8 3c b8 ff ff                                  	call   407b80 <FPC_RERAISE>
  40c344:	5e                                              	pop    esi
  40c345:	5b                                              	pop    ebx
  40c346:	c9                                              	leave  
  40c347:	c3                                              	ret    
	...
